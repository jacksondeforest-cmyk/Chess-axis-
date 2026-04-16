
import { z } from 'zod';
import { createEndpoint } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  description: 'Fetch rating history from Lichess or Chess.com',
  inputSchema: z.object({ username: z.string(), platform: z.enum(['lichess', 'chesscom']) }),
  outputSchema: z.object({
    history: z.record(z.array(z.object({ date: z.number(), rating: z.number() }))),
  }),

  execute: async ({ input }) => {
    const { username, platform } = input;
    const history: Record<string, Array<{ date: number; rating: number }>> = {};

    if (platform === 'lichess') {
      const res = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}/rating-history`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return { history };
      const data = await res.json();

      for (const perfData of data) {
        const name = (perfData.name as string).toLowerCase();
        if (!['bullet', 'blitz', 'rapid', 'classical'].includes(name)) continue;
        history[name] = (perfData.points as number[][]).map(([year, monthIdx, day, rating]) => ({
          date: new Date(year, monthIdx, day).getTime(),
          rating,
        }));
      }
      return { history };
    }

    // Chess.com: build from archives
    const headers = { 'User-Agent': 'ChessAnalytics/1.0 contact@chessanalytics.app', Accept: 'application/json' };
    const archivesRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/games/archives`, { headers });
    if (!archivesRes.ok) return { history };
    const archivesData = await archivesRes.json();
    const urls: string[] = (archivesData.archives || []).slice(-12);

    const ratingByFormat: Record<string, Array<{ date: number; rating: number }>> = {};

    for (const url of urls) {
      const res = await fetch(url, { headers });
      if (!res.ok) continue;
      const data = await res.json();
      for (const g of (data.games || [])) {
        const format = g.time_class || 'unknown';
        if (!['bullet', 'blitz', 'rapid', 'classical', 'daily'].includes(format)) continue;
        if (!ratingByFormat[format]) ratingByFormat[format] = [];
        const playerData = (g.white?.username || '').toLowerCase() === username.toLowerCase() ? g.white : g.black;
        if (playerData?.rating && g.end_time) {
          ratingByFormat[format].push({ date: g.end_time * 1000, rating: playerData.rating });
        }
      }
    }

    // Sample every 5th point to reduce data
    for (const [fmt, pts] of Object.entries(ratingByFormat)) {
      const sorted = pts.sort((a, b) => a.date - b.date);
      history[fmt] = sorted.filter((_, i) => i % 3 === 0 || i === sorted.length - 1).slice(-200);
    }

    return { history };
  },
});
