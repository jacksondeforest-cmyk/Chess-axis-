
import { FetchPlayerStatsOutputType, GenerateInsightsOutputType } from 'zite-endpoints-sdk';
import { Gamepad2, Trophy, Target, Calendar, Flame, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AnimatedNumber from '@/components/AnimatedNumber';
import InsightCard from '@/components/InsightCard';
import ScrollReveal from '@/components/ScrollReveal';
import { Skeleton } from '@/components/ui/skeleton';
import ReportCard from '@/components/dashboard/ReportCard';

type Stats = FetchPlayerStatsOutputType['stats'];
type Insights = GenerateInsightsOutputType['insights'];

interface Props { stats: Stats; insights: Insights | null; isLoadingInsights: boolean; }

const RESULT_COLORS = ['hsl(var(--chart-2))', 'hsl(var(--chart-4))', 'hsl(var(--muted-foreground))'];

function StreakBadge({ type, count }: { type: string; count: number }) {
  const color = type === 'win' ? 'text-chart-2 bg-chart-2/10 border-chart-2/20' : type === 'loss' ? 'text-destructive bg-destructive/10 border-destructive/20' : 'text-muted-foreground bg-muted border-border';
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${color}`}>
      <Flame className="h-3.5 w-3.5" />{count} {type} streak
    </div>
  );
}

export default function OverviewTab({ stats, insights, isLoadingInsights }: Props) {
  const { overall, colorStats, timeControls } = stats;
  const wldData = [
    { name: 'Wins', value: overall.wins },
    { name: 'Losses', value: overall.losses },
    { name: 'Draws', value: overall.draws },
  ].filter(d => d.value > 0);

  const colorData = [
    { name: 'White', winRate: colorStats.white.winRate, games: colorStats.white.games },
    { name: 'Black', winRate: colorStats.black.winRate, games: colorStats.black.games },
  ];

  const bestRating = Math.max(...Object.values(stats.ratings).map(r => r.rating).filter(r => r > 0), 0);

  return (
    <div className="space-y-6">
      {/* Hero stats */}
      <ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Total Games', value: overall.totalGames, icon: <Gamepad2 className="h-4 w-4" />, subtitle: `${overall.gamesThisMonth} this month` },
            { title: 'Win Rate', value: overall.winRate, suffix: '%', icon: <Trophy className="h-4 w-4" />, subtitle: `${overall.wins}W / ${overall.losses}L / ${overall.draws}D`, gradient: true },
            { title: 'Best Rating', value: bestRating, icon: <Zap className="h-4 w-4" />, subtitle: 'Peak across formats', highlight: bestRating > 2000 },
            { title: 'This Month', value: overall.gamesThisMonth, icon: <Calendar className="h-4 w-4" />, subtitle: 'Recent activity' },
          ].map((card, i) => (
            <div key={i} className={`rounded-xl border bg-card p-5 shadow-sm ${card.highlight ? 'border-accent/30 bg-accent/5' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <span className="text-muted-foreground/60">{card.icon}</span>
              </div>
              <p className={`text-2xl font-bold tracking-tight tabular-nums ${card.gradient ? 'gradient-text' : ''}`}>
                <AnimatedNumber value={card.value} suffix={card.suffix || ''} decimals={card.suffix === '%' ? 1 : 0} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScrollReveal delay={0.1}>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold mb-1">Win / Loss / Draw</p>
            <p className="text-xs text-muted-foreground mb-4">Distribution of game outcomes</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={wldData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {wldData.map((_, i) => <Cell key={i} fill={RESULT_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [v, '']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold mb-1">White vs. Black Performance</p>
            <p className="text-xs text-muted-foreground mb-4">Win rate by color</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={colorData} barSize={48}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Win rate']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="winRate" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ScrollReveal>
      </div>

      {/* Streaks */}
      <ScrollReveal delay={0.2}>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Flame className="h-4 w-4 text-accent" />Streaks</p>
          <div className="flex flex-wrap gap-3">
            <StreakBadge type={overall.currentStreak.type} count={overall.currentStreak.count} />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-chart-2/20 bg-chart-2/5 text-chart-2 text-sm font-medium">
              <Trophy className="h-3.5 w-3.5" />Longest win streak: {overall.longestWinStreak}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium">
              <Target className="h-3.5 w-3.5" />Longest loss streak: {overall.longestLossStreak}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* AI Insights */}
      <ScrollReveal delay={0.25}>
        {isLoadingInsights ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="shimmer h-4 w-32 mb-3" />
            <Skeleton className="shimmer h-3 w-full mb-2" />
            <Skeleton className="shimmer h-3 w-5/6" />
          </div>
        ) : insights ? (
          <div className="space-y-4">
            <InsightCard type="info" title="AI Overview" insights={insights.overview} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InsightCard type="success" title="Strengths" insights={insights.strengths} />
              <InsightCard type="warning" title="Areas to Improve" insights={insights.weaknesses} />
            </div>
            <ReportCard reportCard={insights.reportCard} />
            <InsightCard type="prediction" title="Prediction" insights={[insights.prediction]} />
          </div>
        ) : null}
      </ScrollReveal>
    </div>
  );
}
