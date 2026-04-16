
import { FetchPlayerStatsOutputType } from 'zite-endpoints-sdk';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Zap, Flame, Clock, Hourglass, Mail, Timer, LayoutList } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import AnimatedNumber from '@/components/AnimatedNumber';

type Stats = FetchPlayerStatsOutputType['stats'];
const SPEED_ICONS: Record<string, React.ReactNode> = { bullet: <Zap className="h-4 w-4" />, blitz: <Flame className="h-4 w-4" />, rapid: <Clock className="h-4 w-4" />, classical: <Hourglass className="h-4 w-4" />, correspondence: <Mail className="h-4 w-4" /> };
const FORM_COLORS: Record<string, string> = { win: 'bg-chart-2', loss: 'bg-destructive', draw: 'bg-muted-foreground' };

function FormDots({ form }: { form: string[] }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {form.slice(0, 10).map((r, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${FORM_COLORS[r] || 'bg-muted'}`} title={r} />
      ))}
    </div>
  );
}

function WLDBar({ wins, losses, draws, total }: { wins: number; losses: number; draws: number; total: number }) {
  if (total === 0) return null;
  return (
    <div className="flex rounded-full overflow-hidden h-2 bg-muted mt-2">
      <div style={{ width: `${(wins / total) * 100}%` }} className="bg-chart-2 transition-all" />
      <div style={{ width: `${(draws / total) * 100}%` }} className="bg-muted-foreground/50 transition-all" />
      <div style={{ width: `${(losses / total) * 100}%` }} className="bg-destructive transition-all" />
    </div>
  );
}

function PhaseCard({ label, stat, icon, color }: { label: string; stat: any; icon: React.ReactNode; color: string }) {
  return (
    <div className={`rounded-xl border ${color} p-5`}>
      <div className="flex items-center gap-2 mb-3">{icon}<p className="font-semibold text-sm">{label}</p></div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div><p className="text-2xl font-bold tabular-nums"><AnimatedNumber value={stat.winRate} suffix="%" decimals={1} /></p><p className="text-xs text-muted-foreground">win rate</p></div>
        <div><p className="text-2xl font-bold tabular-nums">{stat.games.toLocaleString()}</p><p className="text-xs text-muted-foreground">games</p></div>
      </div>
      <WLDBar wins={stat.wins} losses={stat.losses} draws={stat.draws} total={stat.games} />
      <p className="text-xs text-muted-foreground mt-2">{stat.wins}W / {stat.losses}L / {stat.draws}D</p>
    </div>
  );
}

export default function TimeControlsTab({ stats }: { stats: Stats }) {
  const { timeControls, gameLengthStats, timeoutStats } = stats;
  const sorted = [...timeControls].sort((a, b) => b.games - a.games);

  return (
    <div className="space-y-6">
      {/* Compare chart */}
      <ScrollReveal>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold mb-1">Win Rate by Time Control</p>
          <p className="text-xs text-muted-foreground mb-4">How you perform across formats</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sorted} barSize={40}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Win rate']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="winRate" radius={[6, 6, 0, 0]}>
                {sorted.map((_, i) => <Cell key={i} fill={`hsl(var(--chart-${(i % 5) + 1}))`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ScrollReveal>

      {/* Cards per time control */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((tc, i) => (
          <ScrollReveal key={tc.speed} delay={i * 0.05}>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-primary">
                  {SPEED_ICONS[tc.speed] || <Clock className="h-4 w-4" />}
                  <span className="font-semibold">{tc.name}</span>
                </div>
                {tc.rating > 0 && <span className="text-xl font-bold gradient-text tabular-nums">{tc.rating}</span>}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center"><p className="text-xs text-muted-foreground">Games</p><p className="font-bold text-sm">{tc.games.toLocaleString()}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Win Rate</p><p className="font-bold text-sm text-chart-2"><AnimatedNumber value={tc.winRate} suffix="%" decimals={1} /></p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">W/L/D</p><p className="font-bold text-xs">{tc.wins}/{tc.losses}/{tc.draws}</p></div>
              </div>
              <WLDBar wins={tc.wins} losses={tc.losses} draws={tc.draws} total={tc.games} />
              {tc.recentForm.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1.5">Recent form</p>
                  <FormDots form={tc.recentForm} />
                </div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Game Length Breakdown */}
      {gameLengthStats && (
        <ScrollReveal>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold mb-1 flex items-center gap-2"><LayoutList className="h-4 w-4 text-primary" />Game Length Breakdown</p>
            <p className="text-xs text-muted-foreground mb-4">Discover where you win and lose — opening (&lt;20 moves), middlegame (20–40), endgame (40+)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PhaseCard label="Opening Phase" stat={gameLengthStats.opening} icon={<Zap className="h-4 w-4 text-chart-1" />} color="border-chart-1/20 bg-chart-1/5" />
              <PhaseCard label="Middlegame" stat={gameLengthStats.middlegame} icon={<Flame className="h-4 w-4 text-chart-3" />} color="border-chart-3/20 bg-chart-3/5" />
              <PhaseCard label="Endgame" stat={gameLengthStats.endgame} icon={<Hourglass className="h-4 w-4 text-chart-5" />} color="border-chart-5/20 bg-chart-5/5" />
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Time Scramble / Timeout Analysis */}
      {timeoutStats && (
        <ScrollReveal delay={0.1}>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold mb-1 flex items-center gap-2"><Timer className="h-4 w-4 text-destructive" />Time Scramble Analysis</p>
            <p className="text-xs text-muted-foreground mb-4">How often clock pressure costs you the game</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/40 p-4 text-center">
                <p className={`text-3xl font-bold tabular-nums ${timeoutStats.timeoutLossRate > 20 ? 'text-destructive' : timeoutStats.timeoutLossRate > 10 ? 'text-accent' : 'text-chart-2'}`}>
                  <AnimatedNumber value={timeoutStats.timeoutLossRate} suffix="%" decimals={1} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">of losses by timeout</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4 text-center">
                <p className="text-3xl font-bold tabular-nums text-destructive">{timeoutStats.timeoutLosses}</p>
                <p className="text-xs text-muted-foreground mt-1">games lost on time</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4 text-center">
                <p className="text-3xl font-bold tabular-nums">{timeoutStats.totalLosses}</p>
                <p className="text-xs text-muted-foreground mt-1">total losses analyzed</p>
              </div>
            </div>
            {timeoutStats.timeoutLossRate > 15 && (
              <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <Timer className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-destructive">Clock management is impacting your results.</span> Over {Math.round(timeoutStats.timeoutLossRate)}% of your losses are due to running out of time. Try practicing faster calculation in bullet/blitz puzzles.
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
