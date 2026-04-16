
import { FetchPlayerStatsOutputType, GenerateInsightsOutputType } from 'zite-endpoints-sdk';
import { useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend,
} from 'recharts';
import ScrollReveal from '@/components/ScrollReveal';
import { BookOpen, Swords, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Stats = FetchPlayerStatsOutputType['stats'];
type Insights = GenerateInsightsOutputType['insights'];

interface Props { stats: Stats; insights: Insights | null; }

type Phase = 'Opening' | 'Middlegame' | 'Endgame';

function classifyPhase(moveCount: number): Phase {
  if (moveCount <= 20) return 'Opening';
  if (moveCount <= 40) return 'Middlegame';
  return 'Endgame';
}

function countMoves(movesStr: string): number {
  if (!movesStr) return 0;
  const tokens = movesStr.trim().split(/\s+/);
  return tokens.filter(t => !t.includes('.') && !['1-0', '0-1', '1/2-1/2', '*'].includes(t)).length;
}

const GRADE_COLOR: Record<string, string> = {
  'A+': 'text-chart-2', A: 'text-chart-2', 'A-': 'text-chart-2',
  'B+': 'text-primary', B: 'text-primary', 'B-': 'text-primary',
  'C+': 'text-chart-4', C: 'text-chart-4', 'C-': 'text-chart-4',
  'D+': 'text-destructive', D: 'text-destructive', 'D-': 'text-destructive',
  F: 'text-destructive',
};

const GRADE_BG: Record<string, string> = {
  'A+': 'bg-chart-2/10 border-chart-2/25', A: 'bg-chart-2/10 border-chart-2/25', 'A-': 'bg-chart-2/10 border-chart-2/25',
  'B+': 'bg-primary/10 border-primary/25', B: 'bg-primary/10 border-primary/25', 'B-': 'bg-primary/10 border-primary/25',
  'C+': 'bg-chart-4/10 border-chart-4/25', C: 'bg-chart-4/10 border-chart-4/25', 'C-': 'bg-chart-4/10 border-chart-4/25',
  'D+': 'bg-destructive/10 border-destructive/25', D: 'bg-destructive/10 border-destructive/25', 'D-': 'bg-destructive/10 border-destructive/25',
  F: 'bg-destructive/10 border-destructive/25',
};

function gradeToScore(g: string): number {
  const map: Record<string, number> = { 'A+': 100, A: 93, 'A-': 88, 'B+': 83, B: 77, 'B-': 72, 'C+': 67, C: 60, 'C-': 55, 'D+': 50, D: 43, 'D-': 37, F: 25 };
  return map[g] ?? 60;
}

const PHASE_ICONS = {
  Opening: BookOpen,
  Middlegame: Swords,
  Endgame: Trophy,
};

const PHASE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export default function GamePhaseTab({ stats, insights }: Props) {
  const phaseData = useMemo(() => {
    const buckets: Record<Phase, { wins: number; losses: number; draws: number }> = {
      Opening: { wins: 0, losses: 0, draws: 0 },
      Middlegame: { wins: 0, losses: 0, draws: 0 },
      Endgame: { wins: 0, losses: 0, draws: 0 },
    };

    for (const game of stats.recentGames) {
      const moves = game.moves ? countMoves(game.moves) : 0;
      const phase = classifyPhase(moves);
      if (game.userResult === 'win') buckets[phase].wins++;
      else if (game.userResult === 'loss') buckets[phase].losses++;
      else buckets[phase].draws++;
    }

    return (['Opening', 'Middlegame', 'Endgame'] as Phase[]).map(phase => {
      const { wins, losses, draws } = buckets[phase];
      const total = wins + losses + draws;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
      return { phase, wins, losses, draws, total, winRate };
    });
  }, [stats.recentGames]);

  const reportCard = insights?.reportCard;

  const radarData = [
    { subject: 'Opening', score: reportCard ? gradeToScore(reportCard.openings.grade) : (phaseData[0].winRate) },
    { subject: 'Tactical', score: reportCard ? gradeToScore(reportCard.tactical.grade) : 60 },
    { subject: 'Endgame', score: reportCard ? gradeToScore(reportCard.endgame.grade) : (phaseData[2].winRate) },
    { subject: 'Consistency', score: reportCard ? gradeToScore(reportCard.consistency.grade) : 60 },
    { subject: 'Time Mgmt', score: reportCard ? gradeToScore(reportCard.timeManagement.grade) : 60 },
  ];

  const phaseBreakdownBars = phaseData.map(p => ({
    name: p.phase,
    Wins: p.wins,
    Losses: p.losses,
    Draws: p.draws,
  }));

  return (
    <div className="space-y-6">
      {/* Phase Cards */}
      <ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {phaseData.map((p, i) => {
            const Icon = PHASE_ICONS[p.phase];
            const trend = p.winRate >= 55 ? 'strong' : p.winRate >= 45 ? 'average' : 'weak';
            const TrendIcon = trend === 'strong' ? TrendingUp : trend === 'weak' ? TrendingDown : Minus;
            const trendColor = trend === 'strong' ? 'text-chart-2' : trend === 'weak' ? 'text-destructive' : 'text-muted-foreground';
            return (
              <div key={p.phase} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold text-sm">{p.phase}</span>
                  </div>
                  <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                </div>
                {p.total === 0 ? (
                  <p className="text-sm text-muted-foreground">Not enough data</p>
                ) : (
                  <>
                    <div className="text-3xl font-bold mb-1" style={{ color: PHASE_COLORS[i] }}>
                      {p.winRate}%
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Win rate · {p.total} games</p>
                    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                      <div style={{ width: `${(p.wins / p.total) * 100}%` }} className="bg-chart-2" />
                      <div style={{ width: `${(p.draws / p.total) * 100}%` }} className="bg-muted-foreground/40" />
                      <div style={{ width: `${(p.losses / p.total) * 100}%` }} className="bg-destructive" />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span className="text-chart-2 font-medium">{p.wins}W</span>
                      <span>{p.draws}D</span>
                      <span className="text-destructive font-medium">{p.losses}L</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Phase explainer */}
      <ScrollReveal delay={0.05}>
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">How phases are determined: </span>
            Games that ended in <span className="text-chart-1 font-medium">≤20 moves</span> are classified as Opening phase results,{' '}
            <span className="text-chart-2 font-medium">21–40 moves</span> as Middlegame, and{' '}
            <span className="text-chart-3 font-medium">40+ moves</span> as Endgame. This tells you which stage of the game you tend to win or lose in.
          </p>
        </div>
      </ScrollReveal>

      {/* Bar chart breakdown */}
      <ScrollReveal delay={0.1}>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold mb-1">W/D/L by Game Phase</p>
          <p className="text-xs text-muted-foreground mb-4">How your results are distributed across each phase</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={phaseBreakdownBars} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Wins" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Draws" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Losses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ScrollReveal>

      {/* Radar + Report Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScrollReveal delay={0.15}>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold mb-1">Skill Radar</p>
            <p className="text-xs text-muted-foreground mb-4">AI-assessed ability across 5 key areas</p>
            {reportCard ? (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar name="You" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                Load AI Insights first to see the radar
              </div>
            )}
          </div>
        </ScrollReveal>

        {reportCard && (
          <ScrollReveal delay={0.2}>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-semibold mb-4">Phase Report Card</p>
              <div className="space-y-3">
                {[
                  { label: 'Opening Knowledge', key: 'openings' as const, icon: BookOpen },
                  { label: 'Tactical Vision', key: 'tactical' as const, icon: Swords },
                  { label: 'Endgame Technique', key: 'endgame' as const, icon: Trophy },
                  { label: 'Consistency', key: 'consistency' as const, icon: TrendingUp },
                  { label: 'Time Management', key: 'timeManagement' as const, icon: TrendingUp },
                ].map(({ label, key, icon: Icon }) => {
                  const grade = reportCard[key].grade;
                  const explanation = reportCard[key].explanation;
                  return (
                    <div key={key} className="flex items-start gap-3">
                      <div className={`rounded-lg border px-2.5 py-1 min-w-[44px] text-center shrink-0 ${GRADE_BG[grade] || 'bg-muted border-border'}`}>
                        <span className={`text-sm font-bold ${GRADE_COLOR[grade] || 'text-foreground'}`}>{grade}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* Phase tips */}
      <ScrollReveal delay={0.25}>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold mb-3">Phase-Based Tips</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                phase: 'Opening',
                icon: BookOpen,
                color: 'text-chart-1',
                bg: 'bg-chart-1/10',
                tip: phaseData[0].winRate >= 55
                  ? 'Your opening preparation is solid. Explore the Opening Explorer tab to find even more potent lines.'
                  : phaseData[0].winRate >= 45
                  ? 'Your opening results are average. Check the Openings tab to spot weak lines and improve preparation.'
                  : 'You struggle in the opening. Review your most-played openings and study the mainlines deeply.',
              },
              {
                phase: 'Middlegame',
                icon: Swords,
                color: 'text-chart-2',
                bg: 'bg-chart-2/10',
                tip: phaseData[1].winRate >= 55
                  ? 'Strong middlegame play! Keep creating imbalances and pressing your opponents tactically.'
                  : phaseData[1].winRate >= 45
                  ? 'Decent middlegame results. Focus on improving piece coordination and spotting tactical shots.'
                  : 'Middlegame is a weak point. Practice tactics puzzles daily and focus on piece activity.',
              },
              {
                phase: 'Endgame',
                icon: Trophy,
                color: 'text-chart-3',
                bg: 'bg-chart-3/10',
                tip: phaseData[2].winRate >= 55
                  ? 'Excellent endgame technique! Your ability to convert winning positions is a real strength.'
                  : phaseData[2].winRate >= 45
                  ? 'Average endgame. Study King and Pawn endings, and practice rook endgame techniques.'
                  : 'Endgame needs work. Many games reach endgames — mastering basic endings will boost your rating.',
              },
            ].map(({ phase, icon: Icon, color, bg, tip }) => (
              <div key={phase} className="flex flex-col gap-2 p-4 rounded-lg bg-muted/30 border border-border">
                <div className={`rounded-md ${bg} p-2 w-fit`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="text-xs font-semibold">{phase}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
