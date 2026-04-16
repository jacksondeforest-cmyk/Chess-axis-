
import { z } from 'zod';
import { createEndpoint } from 'zite-integrations-backend-sdk';
import OpenAI from 'openai';

const gradeSchema = z.object({ grade: z.string(), explanation: z.string() });
const priorityItemSchema = z.object({ area: z.string(), priority: z.enum(['high', 'medium', 'low']), description: z.string(), advice: z.string() });

export default createEndpoint({
  description: 'Generate comprehensive AI-powered chess insights using OpenAI',
  inputSchema: z.object({
    username: z.string(),
    stats: z.object({
      overall: z.object({ totalGames: z.number(), wins: z.number(), losses: z.number(), draws: z.number(), winRate: z.number(), gamesThisMonth: z.number(), currentStreak: z.object({ type: z.string(), count: z.number() }), longestWinStreak: z.number(), longestLossStreak: z.number() }),
      ratings: z.record(z.object({ rating: z.number(), games: z.number(), wins: z.number(), losses: z.number(), draws: z.number() })),
      colorStats: z.object({ white: z.object({ games: z.number(), wins: z.number(), winRate: z.number() }), black: z.object({ games: z.number(), wins: z.number(), winRate: z.number() }) }),
      openings: z.object({
        asWhite: z.array(z.object({ name: z.string(), games: z.number(), winRate: z.number() })),
        asBlack: z.array(z.object({ name: z.string(), games: z.number(), winRate: z.number() })),
      }),
      opponents: z.object({ avgOpponentRating: z.number(), vsHigherRated: z.object({ games: z.number(), winRate: z.number() }), vsLowerRated: z.object({ games: z.number(), winRate: z.number() }) }),
      timeControls: z.array(z.object({ name: z.string(), games: z.number(), winRate: z.number(), rating: z.number() })),
      dayOfWeek: z.array(z.object({ day: z.string(), games: z.number(), winRate: z.number() })),
    }),
  }),
  outputSchema: z.object({
    insights: z.object({
      executiveSummary: z.string(),
      overview: z.array(z.string()),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      reportCard: z.object({
        openings: gradeSchema,
        tactical: gradeSchema,
        endgame: gradeSchema,
        consistency: gradeSchema,
        timeManagement: gradeSchema,
      }),
      trainingPriorities: z.array(priorityItemSchema),
      quickWins: z.array(z.string()),
      prediction: z.string(),
      openingInsights: z.array(z.string()),
      trendsInsight: z.string(),
    }),
  }),

  execute: async ({ input }) => {
    const client = new OpenAI({ apiKey: process.env.ZITE_OPENAI_ACCESS_TOKEN ?? '' });
    const { username, stats } = input;

    const bestRating = Math.max(...Object.values(stats.ratings).map(r => r.rating).filter(r => r > 0), 0);
    const bestFormat = [...stats.timeControls].sort((a, b) => b.games - a.games)[0]?.name || 'Blitz';
    const sortedFormats = [...stats.timeControls].sort((a, b) => b.games - a.games);
    const bestDay = [...stats.dayOfWeek].filter(d => d.games > 2).sort((a, b) => b.winRate - a.winRate)[0];
    const worstDay = [...stats.dayOfWeek].filter(d => d.games > 2).sort((a, b) => a.winRate - b.winRate)[0];
    const topWhiteOpening = stats.openings.asWhite[0];
    const topBlackOpening = stats.openings.asBlack[0];
    const worstWhiteOpening = [...stats.openings.asWhite].filter(o => o.games >= 3).sort((a, b) => a.winRate - b.winRate)[0];
    const worstBlackOpening = [...stats.openings.asBlack].filter(o => o.games >= 3).sort((a, b) => a.winRate - b.winRate)[0];

    const prompt = `You are an expert chess coach. Analyze "${username}"'s complete chess statistics and provide actionable, personalized coaching insights.

PLAYER DATA:
- Total games analyzed: ${stats.overall.totalGames}
- Overall win rate: ${stats.overall.winRate}% (${stats.overall.wins}W/${stats.overall.losses}L/${stats.overall.draws}D)
- Best rating: ${bestRating} (${bestFormat})
- Most played format: ${bestFormat} (${sortedFormats[0]?.games || 0} games)
- Current streak: ${stats.overall.currentStreak.count} ${stats.overall.currentStreak.type}(s)
- Longest win streak: ${stats.overall.longestWinStreak} | Longest loss streak: ${stats.overall.longestLossStreak}
- White win rate: ${stats.colorStats.white.winRate}% (${stats.colorStats.white.games} games)
- Black win rate: ${stats.colorStats.black.winRate}% (${stats.colorStats.black.games} games)
- Best white opening: ${topWhiteOpening ? `${topWhiteOpening.name} (${topWhiteOpening.winRate}% in ${topWhiteOpening.games} games)` : 'N/A'}
- Worst white opening: ${worstWhiteOpening ? `${worstWhiteOpening.name} (${worstWhiteOpening.winRate}% in ${worstWhiteOpening.games} games)` : 'N/A'}
- Best black opening: ${topBlackOpening ? `${topBlackOpening.name} (${topBlackOpening.winRate}% in ${topBlackOpening.games} games)` : 'N/A'}
- Worst black opening: ${worstBlackOpening ? `${worstBlackOpening.name} (${worstBlackOpening.winRate}% in ${worstBlackOpening.games} games)` : 'N/A'}
- Best day to play: ${bestDay?.day} (${bestDay?.winRate}%) | Worst day: ${worstDay?.day} (${worstDay?.winRate}%)
- vs higher rated: ${stats.opponents.vsHigherRated.winRate}% in ${stats.opponents.vsHigherRated.games} games
- vs lower rated: ${stats.opponents.vsLowerRated.winRate}% in ${stats.opponents.vsLowerRated.games} games
- Avg opponent rating: ${stats.opponents.avgOpponentRating}
- Performance by format: ${sortedFormats.map(t => `${t.name}: ${t.rating} rating, ${t.winRate}% wins`).join(' | ')}

Respond ONLY with a valid JSON object (no markdown fences) matching this EXACT structure:
{
  "executiveSummary": "2-3 sentence honest, personalized overall assessment of this player's chess. Mention their best format, overall win rate, and one key characteristic.",
  "overview": ["Specific insight about their overall performance", "Insight about their rating/format strength", "Insight about their current form/streak"],
  "strengths": ["Specific strength 1 with data", "Specific strength 2 with data", "Specific strength 3 with data"],
  "weaknesses": ["Specific weakness 1 with data", "Specific weakness 2 with data", "Specific weakness 3 with data"],
  "reportCard": {
    "openings": {"grade": "B", "explanation": "One sentence about opening play based on the data"},
    "tactical": {"grade": "B+", "explanation": "One sentence about tactical awareness"},
    "endgame": {"grade": "B-", "explanation": "One sentence about endgame based on win rate patterns"},
    "consistency": {"grade": "B", "explanation": "One sentence about consistency"},
    "timeManagement": {"grade": "B+", "explanation": "One sentence about time management"}
  },
  "trainingPriorities": [
    {"area": "Specific area name", "priority": "high", "description": "Why this is important for this specific player", "advice": "Concrete actionable step: what to study, practice, or focus on"},
    {"area": "Second area", "priority": "medium", "description": "Why this matters", "advice": "Concrete advice"},
    {"area": "Third area", "priority": "medium", "description": "Why this matters", "advice": "Concrete advice"},
    {"area": "Fourth area", "priority": "low", "description": "Minor improvement", "advice": "Simple suggestion"}
  ],
  "quickWins": ["Very specific, actionable quick improvement 1", "Quick win 2", "Quick win 3", "Quick win 4"],
  "prediction": "Specific prediction about rating trajectory based on their data",
  "openingInsights": ["Specific opening insight with data", "Second opening insight with recommendation"],
  "trendsInsight": "One sentence about their performance trends and trajectory"
}

Rules: Be specific and use the player's actual data. Reference "${username}" in the executiveSummary. Grades go from A+ to D. trainingPriorities must have exactly 4 items. quickWins must have exactly 4 items.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    });

    const content = completion.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);

    const defaultGrade = { grade: 'B', explanation: 'Analysis unavailable' };
    return {
      insights: {
        executiveSummary: parsed.executiveSummary || '',
        overview: parsed.overview || [],
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        reportCard: {
          openings: parsed.reportCard?.openings || defaultGrade,
          tactical: parsed.reportCard?.tactical || defaultGrade,
          endgame: parsed.reportCard?.endgame || defaultGrade,
          consistency: parsed.reportCard?.consistency || defaultGrade,
          timeManagement: parsed.reportCard?.timeManagement || defaultGrade,
        },
        trainingPriorities: parsed.trainingPriorities || [],
        quickWins: parsed.quickWins || [],
        prediction: parsed.prediction || '',
        openingInsights: parsed.openingInsights || [],
        trendsInsight: parsed.trendsInsight || '',
      },
    };
  },
});
