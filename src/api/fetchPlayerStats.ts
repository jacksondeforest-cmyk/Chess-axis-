
import { z } from 'zod';
import { createEndpoint } from 'zite-integrations-backend-sdk';

// ─── Helpers ────────────────────────────────────────────────────────────────

function parsePgnHeaders(pgn: string): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const m of pgn.matchAll(/\[(\w+)\s+"([^"]+)"\]/g)) headers[m[1]] = m[2];
  return headers;
}

function extractMovesFromPgn(pgn: string): string {
  const body = pgn.split(/\n\n/).slice(1).join('\n\n');
  return body.replace(/\{[^}]*\}/g, '').replace(/\([^)]*\)/g, '').replace(/\d+\.\.\./g, '').replace(/\d+\./g, '')
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, '').replace(/[!?]+/g, '').trim().split(/\s+/).filter(Boolean).join(' ');
}

function computeStats(games: any[], username: string) {
  const lower = username.toLowerCase();
  const processed = games.map(g => {
    const isWhite = (g.white.username || '').toLowerCase() === lower;
    const userColor = isWhite ? 'white' : 'black';
    const oppColor = isWhite ? 'black' : 'white';
    const opponentUsername = g[oppColor].username || 'Anonymous';
    const opponentRating = g[oppColor].rating || 0;
    const userRating = g[userColor].rating || 0;
    let userResult: 'win' | 'loss' | 'draw';
    if (g.result === 'draw') userResult = 'draw';
    else userResult = g.result === userColor ? 'win' : 'loss';
    return { ...g, userColor, userResult, opponentUsername, opponentRating, userRating };
  });

  // Overall
  const wins = processed.filter(g => g.userResult === 'win').length;
  const losses = processed.filter(g => g.userResult === 'loss').length;
  const draws = processed.filter(g => g.userResult === 'draw').length;
  const total = processed.length;
  const winRate = total > 0 ? Math.round((wins / total) * 1000) / 10 : 0;

  // Monthly
  const now = Date.now();
  const monthAgo = now - 30 * 24 * 3600 * 1000;
  const gamesThisMonth = processed.filter(g => g.date > monthAgo).length;

  // Streaks
  const sorted = [...processed].sort((a, b) => b.date - a.date);
  let curType: 'win' | 'loss' | 'draw' = (sorted[0]?.userResult as 'win' | 'loss' | 'draw') || 'win', curCount = 0;
  for (const g of sorted) { if (g.userResult === curType) curCount++; else break; }

  const chron = [...processed].sort((a, b) => a.date - b.date);
  let longestWin = 0, longestLoss = 0, tmpW = 0, tmpL = 0;
  for (const g of chron) {
    if (g.userResult === 'win') { tmpW++; tmpL = 0; } else if (g.userResult === 'loss') { tmpL++; tmpW = 0; } else { tmpW = 0; tmpL = 0; }
    longestWin = Math.max(longestWin, tmpW); longestLoss = Math.max(longestLoss, tmpL);
  }

  // Color stats
  const white = processed.filter(g => g.userColor === 'white');
  const black = processed.filter(g => g.userColor === 'black');
  const colorStat = (arr: any[]) => {
    const w = arr.filter(g => g.userResult === 'win').length;
    const l = arr.filter(g => g.userResult === 'loss').length;
    const d = arr.filter(g => g.userResult === 'draw').length;
    return { games: arr.length, wins: w, losses: l, draws: d, winRate: arr.length > 0 ? Math.round((w / arr.length) * 1000) / 10 : 0 };
  };

  // Openings
  const openingMap: Record<string, any> = {};
  for (const g of processed) {
    const key = `${g.userColor}|${g.opening || 'Unknown'}|${g.eco || '?'}`;
    if (!openingMap[key]) openingMap[key] = { name: g.opening || 'Unknown', eco: g.eco || '?', color: g.userColor, games: 0, wins: 0, losses: 0, draws: 0 };
    openingMap[key].games++;
    if (g.userResult === 'win') openingMap[key].wins++;
    else if (g.userResult === 'loss') openingMap[key].losses++;
    else openingMap[key].draws++;
  }
  const allOpenings = Object.values(openingMap).map((o: any) => ({ ...o, winRate: Math.round((o.wins / o.games) * 1000) / 10 }));
  const asWhite = allOpenings.filter((o: any) => o.color === 'white').sort((a: any, b: any) => b.games - a.games).slice(0, 10);
  const asBlack = allOpenings.filter((o: any) => o.color === 'black').sort((a: any, b: any) => b.games - a.games).slice(0, 10);

  // First moves
  const firstMoveMap: Record<string, { count: number; wins: number }> = {};
  for (const g of white) {
    const fm = (g.moves || '').split(' ')[0];
    if (fm) { if (!firstMoveMap[fm]) firstMoveMap[fm] = { count: 0, wins: 0 }; firstMoveMap[fm].count++; if (g.userResult === 'win') firstMoveMap[fm].wins++; }
  }
  const firstMoves = Object.entries(firstMoveMap).map(([move, d]) => ({ move, count: d.count, winRate: Math.round((d.wins / d.count) * 1000) / 10 })).sort((a, b) => b.count - a.count).slice(0, 5);

  // Opponents
  const oppMap: Record<string, any> = {};
  for (const g of processed) {
    const k = g.opponentUsername.toLowerCase();
    if (!oppMap[k]) oppMap[k] = { username: g.opponentUsername, games: 0, wins: 0, losses: 0, draws: 0, totalRating: 0 };
    oppMap[k].games++; oppMap[k].totalRating += g.opponentRating;
    if (g.userResult === 'win') oppMap[k].wins++;
    else if (g.userResult === 'loss') oppMap[k].losses++;
    else oppMap[k].draws++;
  }
  const oppList = Object.values(oppMap).map((o: any) => ({ ...o, avgRating: Math.round(o.totalRating / o.games), winRate: Math.round((o.wins / o.games) * 1000) / 10 }));
  const frequent = oppList.sort((a: any, b: any) => b.games - a.games).slice(0, 10);
  const nemeses = oppList.filter((o: any) => o.games >= 3).sort((a: any, b: any) => a.winRate - b.winRate).slice(0, 5);
  const avgOppRating = processed.length > 0 ? Math.round(processed.reduce((s, g) => s + g.opponentRating, 0) / processed.length) : 0;
  const userRatings = processed.filter(g => g.userRating > 0);
  const avgUserRating = userRatings.length > 0 ? userRatings.reduce((s, g) => s + g.userRating, 0) / userRatings.length : 0;
  const higher = processed.filter(g => g.opponentRating > avgUserRating + 50);
  const lowerRated = processed.filter(g => g.opponentRating < avgUserRating - 50);
  const similar = processed.filter(g => Math.abs(g.opponentRating - avgUserRating) <= 50);
  const strStats = (arr: any[]) => ({ games: arr.length, wins: arr.filter(g => g.userResult === 'win').length, winRate: arr.length > 0 ? Math.round((arr.filter(g => g.userResult === 'win').length / arr.length) * 1000) / 10 : 0 });
  const phaseStat = (arr: any[]) => { const w = arr.filter((g: any) => g.userResult === 'win').length; const l = arr.filter((g: any) => g.userResult === 'loss').length; const d = arr.filter((g: any) => g.userResult === 'draw').length; return { games: arr.length, wins: w, losses: l, draws: d, winRate: arr.length > 0 ? Math.round((w / arr.length) * 1000) / 10 : 0 }; };
  const gameLengthStats = { opening: phaseStat(processed.filter((g: any) => (g.movesCount || 0) > 0 && (g.movesCount || 0) < 20)), middlegame: phaseStat(processed.filter((g: any) => (g.movesCount || 0) >= 20 && (g.movesCount || 0) < 40)), endgame: phaseStat(processed.filter((g: any) => (g.movesCount || 0) >= 40)) };
  const timeoutLosses = processed.filter((g: any) => g.endedByTimeout && g.userResult === 'loss').length;
  const timeoutStats = { timeoutLosses, totalLosses: losses, timeoutLossRate: losses > 0 ? Math.round((timeoutLosses / losses) * 1000) / 10 : 0 };
  const accuracyGames = processed.filter((g: any) => g.userAccuracy != null);
  const avgAccuracy: number | undefined = accuracyGames.length > 0 ? Math.round(accuracyGames.reduce((s: number, g: any) => s + (g.userAccuracy || 0), 0) / accuracyGames.length * 10) / 10 : undefined;

  // Day of week
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayMap: Record<number, { games: number; wins: number }> = {};
  for (let i = 0; i < 7; i++) dayMap[i] = { games: 0, wins: 0 };
  for (const g of processed) { const d = new Date(g.date).getDay(); dayMap[d].games++; if (g.userResult === 'win') dayMap[d].wins++; }
  const dayOfWeek = DAYS.map((day, i) => ({ day, games: dayMap[i].games, wins: dayMap[i].wins, winRate: dayMap[i].games > 0 ? Math.round((dayMap[i].wins / dayMap[i].games) * 1000) / 10 : 0 }));

  // Time controls
  const tcMap: Record<string, any> = {};
  for (const g of processed) {
    const k = g.speed || 'unknown';
    if (!tcMap[k]) tcMap[k] = { name: k.charAt(0).toUpperCase() + k.slice(1), speed: k, games: 0, wins: 0, losses: 0, draws: 0, form: [] };
    tcMap[k].games++; if (g.userResult === 'win') tcMap[k].wins++; else if (g.userResult === 'loss') tcMap[k].losses++; else tcMap[k].draws++;
    if (tcMap[k].form.length < 10) tcMap[k].form.unshift(g.userResult);
  }
  const timeControls = Object.values(tcMap).map((tc: any) => ({
    ...tc, winRate: Math.round((tc.wins / tc.games) * 1000) / 10, rating: 0, recentForm: tc.form,
  }));

  return { wins, losses, draws, total, winRate, gamesThisMonth, currentStreak: { type: curType, count: curCount }, longestWinStreak: longestWin, longestLossStreak: longestLoss, colorStats: { white: colorStat(white), black: colorStat(black) }, openings: { asWhite, asBlack, firstMoves }, opponents: { frequent, nemeses, avgOpponentRating: avgOppRating, vsHigherRated: strStats(higher), vsLowerRated: strStats(lowerRated), vsSimilarRated: strStats(similar) }, dayOfWeek, timeControls, gameLengthStats, timeoutStats, avgAccuracy };
}

// ─── Output schema ───────────────────────────────────────────────────────────

const ratingSchema = z.object({ rating: z.number(), min: z.number(), max: z.number(), games: z.number(), wins: z.number(), losses: z.number(), draws: z.number() });
const openingSchema = z.object({ name: z.string(), eco: z.string(), games: z.number(), wins: z.number(), losses: z.number(), draws: z.number(), winRate: z.number() });
const oppSchema = z.object({ username: z.string(), games: z.number(), wins: z.number(), losses: z.number(), draws: z.number(), avgRating: z.number(), winRate: z.number() });
const colorStatSchema = z.object({ games: z.number(), wins: z.number(), losses: z.number(), draws: z.number(), winRate: z.number() });
const strSchema = z.object({ games: z.number(), wins: z.number(), winRate: z.number() });

// ─── Endpoint ────────────────────────────────────────────────────────────────

export default createEndpoint({
  description: 'Fetch and process chess player statistics from Lichess or Chess.com',
  inputSchema: z.object({ username: z.string(), platform: z.enum(['lichess', 'chesscom']) }),
  outputSchema: z.object({
    stats: z.object({
      profile: z.object({ username: z.string(), title: z.string().optional(), country: z.string().optional(), avatar: z.string().optional(), joinedAt: z.number().optional(), platform: z.enum(['lichess', 'chesscom']), url: z.string() }),
      overall: z.object({ totalGames: z.number(), wins: z.number(), losses: z.number(), draws: z.number(), winRate: z.number(), gamesThisMonth: z.number(), currentStreak: z.object({ type: z.enum(['win', 'loss', 'draw']), count: z.number() }), longestWinStreak: z.number(), longestLossStreak: z.number() }),
      ratings: z.record(ratingSchema),
      colorStats: z.object({ white: colorStatSchema, black: colorStatSchema }),
      openings: z.object({ asWhite: z.array(openingSchema), asBlack: z.array(openingSchema), firstMoves: z.array(z.object({ move: z.string(), count: z.number(), winRate: z.number() })) }),
      opponents: z.object({ frequent: z.array(oppSchema), avgOpponentRating: z.number(), vsHigherRated: strSchema, vsLowerRated: strSchema, vsSimilarRated: strSchema, nemeses: z.array(oppSchema) }),
      recentGames: z.array(z.object({ id: z.string(), white: z.object({ username: z.string(), rating: z.number() }), black: z.object({ username: z.string(), rating: z.number() }), result: z.string(), userColor: z.string(), userResult: z.enum(['win', 'loss', 'draw']), opening: z.string().optional(), eco: z.string().optional(), timeControl: z.string(), speed: z.string(), date: z.number(), url: z.string(), moves: z.string().optional() })),
      timeControls: z.array(z.object({ name: z.string(), speed: z.string(), games: z.number(), wins: z.number(), losses: z.number(), draws: z.number(), winRate: z.number(), rating: z.number(), recentForm: z.array(z.string()) })),
      dayOfWeek: z.array(z.object({ day: z.string(), games: z.number(), wins: z.number(), winRate: z.number() })),
      gameLengthStats: z.object({ opening: z.object({ games: z.number(), wins: z.number(), losses: z.number(), draws: z.number(), winRate: z.number() }), middlegame: z.object({ games: z.number(), wins: z.number(), losses: z.number(), draws: z.number(), winRate: z.number() }), endgame: z.object({ games: z.number(), wins: z.number(), losses: z.number(), draws: z.number(), winRate: z.number() }) }),
      timeoutStats: z.object({ timeoutLosses: z.number(), totalLosses: z.number(), timeoutLossRate: z.number() }),
      avgAccuracy: z.number().optional(),
    }),
  }),

  execute: async ({ input }) => {
    const { username, platform } = input;

    if (platform === 'lichess') {
      const headers = { 'Accept': 'application/json', 'User-Agent': 'ChessAnalytics/1.0' };

      const profileRes = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`, { headers });
      if (!profileRes.ok) throw new Error(profileRes.status === 404 ? `User "${username}" not found on Lichess` : 'Failed to fetch Lichess profile');
      const profile = await profileRes.json();

      // Fetch up to 500 games for comprehensive analysis; moves only needed for recent 20 (board viewer)
      const gamesRes = await fetch(`https://lichess.org/api/games/user/${encodeURIComponent(username)}?max=500&opening=true&moves=true&tags=true`, { headers: { ...headers, 'Accept': 'application/x-ndjson' } });
      const gamesText = await gamesRes.text();
      const games = gamesText.split('\n').filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

      const normalizedGames = games.map((g: any, index: number) => ({
        id: g.id,
        white: { username: g.players?.white?.user?.name || 'Anonymous', rating: g.players?.white?.rating || 0 },
        black: { username: g.players?.black?.user?.name || 'Anonymous', rating: g.players?.black?.rating || 0 },
        result: g.winner || 'draw',
        opening: g.opening?.name,
        eco: g.opening?.eco,
        speed: g.speed || g.perf || 'unknown',
        timeControl: g.speed || 'unknown',
        date: g.createdAt || Date.now(),
        url: `https://lichess.org/${g.id}`,
        moves: index < 20 ? g.moves : undefined,
        movesCount: Math.ceil(((g.moves || '').trim().split(/\s+/).filter(Boolean).length) / 2),
        endedByTimeout: g.status === 'outoftime',
      }));

      const computed = computeStats(normalizedGames, username);

      // Ratings from perfs
      const ratings: Record<string, any> = {};
      for (const [key, val] of Object.entries(profile.perfs || {})) {
        const p = val as any;
        if (p.games > 0) ratings[key] = { rating: p.rating || 0, min: p.rating || 0, max: p.rating || 0, games: p.games || 0, wins: 0, losses: 0, draws: 0 };
      }
      // Enrich ratings with computed W/L/D
      for (const tc of computed.timeControls) {
        if (ratings[tc.speed]) { ratings[tc.speed].wins = tc.wins; ratings[tc.speed].losses = tc.losses; ratings[tc.speed].draws = tc.draws; }
        else { ratings[tc.speed] = { rating: 0, min: 0, max: 0, games: tc.games, wins: tc.wins, losses: tc.losses, draws: tc.draws }; }
      }
      const timeControlsWithRating = computed.timeControls.map(tc => ({ ...tc, rating: ratings[tc.speed]?.rating || 0 }));

      return {
        stats: {
          profile: { username: profile.username, title: profile.title, country: profile.profile?.country, avatar: `https://lichess1.org/assets/images/user-default.png`, joinedAt: profile.createdAt, platform: 'lichess' as const, url: `https://lichess.org/@/${profile.username}` },
          overall: { totalGames: computed.total, wins: computed.wins, losses: computed.losses, draws: computed.draws, winRate: computed.winRate, gamesThisMonth: computed.gamesThisMonth, currentStreak: computed.currentStreak, longestWinStreak: computed.longestWinStreak, longestLossStreak: computed.longestLossStreak },
          ratings,
          colorStats: computed.colorStats,
          openings: computed.openings,
          opponents: computed.opponents,
          recentGames: normalizedGames.slice(0, 20).map(g => {
            const uc: 'white'|'black' = g.white.username.toLowerCase() === username.toLowerCase() ? 'white' : 'black';
            const ur: 'win'|'loss'|'draw' = g.result === 'draw' ? 'draw' : g.result === uc ? 'win' : 'loss';
            return { ...g, userColor: uc, userResult: ur };
          }),
          timeControls: timeControlsWithRating,
          dayOfWeek: computed.dayOfWeek,
          gameLengthStats: computed.gameLengthStats,
          timeoutStats: computed.timeoutStats,
          avgAccuracy: computed.avgAccuracy,
        },
      };
    }

    // Chess.com
    const chessComHeaders = { 'User-Agent': 'ChessAnalytics/1.0 contact@chessanalytics.app', 'Accept': 'application/json' };

    const profileRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}`, { headers: chessComHeaders });
    if (!profileRes.ok) throw new Error(profileRes.status === 404 ? `User "${username}" not found on Chess.com` : 'Failed to fetch Chess.com profile');
    const profile = await profileRes.json();

    const statsRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/stats`, { headers: chessComHeaders });
    const statsData = await statsRes.json();

    const archivesRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/games/archives`, { headers: chessComHeaders });
    const archivesData = await archivesRes.json();
    // Fetch ALL available archives (full history) for comprehensive analysis
    const archiveUrls: string[] = (archivesData.archives || []);

    const allGames: any[] = [];
    for (const url of archiveUrls) {
      const res = await fetch(url, { headers: chessComHeaders });
      if (!res.ok) continue;
      const data = await res.json();
      allGames.push(...(data.games || []));
    }

    // Sort most recent first
    const sortedGames = allGames.sort((a, b) => (b.end_time || 0) - (a.end_time || 0));

    const normalizedGames = sortedGames.map((g: any, index: number) => {
      const pgnHeaders = parsePgnHeaders(g.pgn || '');
      const isUserWhite = (g.white?.username || '').toLowerCase() === username.toLowerCase();
      return {
        id: g.uuid || String(g.end_time),
        white: { username: g.white?.username || pgnHeaders['White'] || 'Unknown', rating: g.white?.rating || parseInt(pgnHeaders['WhiteElo'] || '0') },
        black: { username: g.black?.username || pgnHeaders['Black'] || 'Unknown', rating: g.black?.rating || parseInt(pgnHeaders['BlackElo'] || '0') },
        result: g.white?.result === 'win' ? 'white' : g.black?.result === 'win' ? 'black' : 'draw',
        opening: pgnHeaders['Opening'] || pgnHeaders['ECOUrl']?.split('/').pop()?.replace(/-/g, ' '),
        eco: pgnHeaders['ECO'],
        speed: g.time_class || 'unknown',
        timeControl: g.time_control || 'unknown',
        date: (g.end_time || 0) * 1000,
        url: g.url || '',
        moves: index < 20 ? extractMovesFromPgn(g.pgn || '') : undefined,
        movesCount: ((g.pgn || '').match(/\d+\./g) || []).length,
        endedByTimeout: g.white?.result === 'timeout' || g.black?.result === 'timeout',
        userAccuracy: g.accuracies ? (isUserWhite ? g.accuracies.white : g.accuracies.black) : undefined,
      };
    });

    const computed = computeStats(normalizedGames, username);

    const ratings: Record<string, any> = {};
    const formatMap: Record<string, string> = { chess_bullet: 'bullet', chess_blitz: 'blitz', chess_rapid: 'rapid', chess_daily: 'correspondence' };
    for (const [key, label] of Object.entries(formatMap)) {
      const s = (statsData[key] || statsData[`${key}_960`]) as any;
      if (s) {
        const rec = s.record || {}; const last = s.last || {}; const best = s.best || {};
        ratings[label] = { rating: last.rating || 0, min: 0, max: best.rating || last.rating || 0, games: (rec.win || 0) + (rec.loss || 0) + (rec.draw || 0), wins: rec.win || 0, losses: rec.loss || 0, draws: rec.draw || 0 };
      }
    }

    const timeControlsWithRating = computed.timeControls.map(tc => ({ ...tc, rating: ratings[tc.speed]?.rating || 0 }));

    return {
      stats: {
        profile: { username: profile.username, title: profile.title, country: profile.country, avatar: profile.avatar, joinedAt: profile.joined ? profile.joined * 1000 : undefined, platform: 'chesscom' as const, url: profile.url || `https://www.chess.com/member/${username}` },
        overall: { totalGames: computed.total, wins: computed.wins, losses: computed.losses, draws: computed.draws, winRate: computed.winRate, gamesThisMonth: computed.gamesThisMonth, currentStreak: computed.currentStreak, longestWinStreak: computed.longestWinStreak, longestLossStreak: computed.longestLossStreak },
        ratings,
        colorStats: computed.colorStats,
        openings: computed.openings,
        opponents: computed.opponents,
        recentGames: normalizedGames.slice(0, 20).map(g => {
          const uc = g.white.username.toLowerCase() === username.toLowerCase() ? 'white' : 'black';
          const ur: 'win'|'loss'|'draw' = g.result === 'draw' ? 'draw' : g.result === uc ? 'win' : 'loss';
          return { ...g, userColor: uc, userResult: ur };
        }),
        timeControls: timeControlsWithRating,
        dayOfWeek: computed.dayOfWeek,
        gameLengthStats: computed.gameLengthStats,
        timeoutStats: computed.timeoutStats,
        avgAccuracy: computed.avgAccuracy,
      },
    };
  },
});
