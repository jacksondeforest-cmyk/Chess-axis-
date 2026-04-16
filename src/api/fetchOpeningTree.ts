
import { z } from 'zod';
import { createEndpoint } from 'zite-integrations-backend-sdk';

type TreeNode = { move: string; games: number; wins: number; losses: number; draws: number; winRate: number; children: Record<string, TreeNode> };

function parsePgnHeaders(pgn: string): Record<string, string> {
  const h: Record<string, string> = {};
  for (const m of pgn.matchAll(/\[(\w+)\s+"([^"]+)"\]/g)) h[m[1]] = m[2];
  return h;
}

function extractMovesFromPgn(pgn: string): string {
  const body = pgn.split(/\n\n/).slice(1).join('\n\n');
  return body.replace(/\{[^}]*\}/g, '').replace(/\([^)]*\)/g, '').replace(/\d+\.\.\./g, '').replace(/\d+\./g, '')
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, '').replace(/[!?]+/g, '').trim().split(/\s+/).filter(Boolean).join(' ');
}

function addToTree(root: Record<string, TreeNode>, moves: string[], result: 'win' | 'loss' | 'draw', maxDepth: number) {
  let node = root;
  for (let i = 0; i < Math.min(moves.length, maxDepth); i++) {
    const mv = moves[i];
    if (!node[mv]) node[mv] = { move: mv, games: 0, wins: 0, losses: 0, draws: 0, winRate: 0, children: {} };
    node[mv].games++;
    if (result === 'win') node[mv].wins++;
    else if (result === 'loss') node[mv].losses++;
    else node[mv].draws++;
    node[mv].winRate = Math.round((node[mv].wins / node[mv].games) * 1000) / 10;
    node = node[mv].children;
  }
}

function pruneTree(node: Record<string, TreeNode>, minGames: number): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, n] of Object.entries(node)) {
    if (n.games >= minGames) out[k] = { ...n, children: pruneTree(n.children, minGames) };
  }
  return out;
}

export default createEndpoint({
  description: 'Build an opening move tree from player game history',
  inputSchema: z.object({ username: z.string(), platform: z.enum(['lichess', 'chesscom']), color: z.enum(['white', 'black']) }),
  outputSchema: z.object({ tree: z.record(z.any()), totalGames: z.number() }),

  execute: async ({ input }) => {
    const { username, platform, color } = input;
    const root: Record<string, TreeNode> = {};
    let totalGames = 0;

    if (platform === 'lichess') {
      const res = await fetch(
        `https://lichess.org/api/games/user/${encodeURIComponent(username)}?max=500&moves=true&color=${color}`,
        { headers: { Accept: 'application/x-ndjson', 'User-Agent': 'ChessAnalytics/1.0' } }
      );
      const text = await res.text();
      const games = text.split('\n').filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      for (const g of games) {
        const isWhite = (g.players?.white?.user?.name || '').toLowerCase() === username.toLowerCase();
        if ((isWhite ? 'white' : 'black') !== color) continue;
        const result: 'win' | 'loss' | 'draw' = !g.winner ? 'draw' : g.winner === color ? 'win' : 'loss';
        addToTree(root, (g.moves || '').trim().split(/\s+/).filter(Boolean), result, 16);
        totalGames++;
      }
    } else {
      const headers = { 'User-Agent': 'ChessAnalytics/1.0 contact@chessanalytics.app', Accept: 'application/json' };
      const archivesRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/games/archives`, { headers });
      if (!archivesRes.ok) return { tree: {}, totalGames: 0 };
      const archivesData = await archivesRes.json();
      for (const url of (archivesData.archives || []).slice(-24)) {
        const r = await fetch(url, { headers });
        if (!r.ok) continue;
        const data = await r.json();
        for (const g of (data.games || [])) {
          const isWhite = (g.white?.username || '').toLowerCase() === username.toLowerCase();
          if ((isWhite ? 'white' : 'black') !== color) continue;
          const uc = isWhite ? 'white' : 'black';
          const result: 'win' | 'loss' | 'draw' = g[uc]?.result === 'win' ? 'win' : ['checkmated', 'timeout', 'resigned', 'abandoned'].includes(g[uc]?.result) ? 'loss' : 'draw';
          const moves = extractMovesFromPgn(g.pgn || '').split(' ').filter(Boolean);
          addToTree(root, moves, result, 16);
          totalGames++;
        }
      }
    }

    return { tree: pruneTree(root, 2), totalGames };
  },
});
