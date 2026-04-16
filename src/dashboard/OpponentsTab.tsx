
import { FetchPlayerStatsOutputType } from 'zite-endpoints-sdk';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Swords, TrendingDown } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import StatCard from '@/components/StatCard';

type Stats = FetchPlayerStatsOutputType['stats'];

function WLBar({ wins, losses, draws, compact }: { wins: number; losses: number; draws: number; compact?: boolean }) {
  const total = wins + losses + draws;
  if (total === 0) return null;
  return (
    <div className={`flex rounded-full overflow-hidden ${compact ? 'h-1.5 w-24' : 'h-2 mt-2'} bg-muted`}>
      <div style={{ width: `${(wins / total) * 100}%` }} className="bg-chart-2" />
      <div style={{ width: `${(draws / total) * 100}%` }} className="bg-muted-foreground/40" />
      <div style={{ width: `${(losses / total) * 100}%` }} className="bg-destructive" />
    </div>
  );
}

export default function OpponentsTab({ stats }: { stats: Stats }) {
  const { opponents } = stats;
  const strengthData = [
    { name: 'Higher Rated', winRate: opponents.vsHigherRated.winRate, games: opponents.vsHigherRated.games },
    { name: 'Similar', winRate: opponents.vsSimilarRated.winRate, games: opponents.vsSimilarRated.games },
    { name: 'Lower Rated', winRate: opponents.vsLowerRated.winRate, games: opponents.vsLowerRated.games },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Avg Opponent Rating" value={opponents.avgOpponentRating} icon={<Swords className="h-4 w-4" />} subtitle="Rating of opponents faced" />
          <StatCard title="vs Higher Rated" value={`${opponents.vsHigherRated.winRate}%`} subtitle={`${opponents.vsHigherRated.games} games`} trend={opponents.vsHigherRated.winRate >= 40 ? 'up' : 'down'} />
          <StatCard title="vs Lower Rated" value={`${opponents.vsLowerRated.winRate}%`} subtitle={`${opponents.vsLowerRated.games} games`} trend={opponents.vsLowerRated.winRate >= 60 ? 'up' : 'neutral'} />
        </div>
      </ScrollReveal>

      {/* Strength comparison chart */}
      <ScrollReveal delay={0.1}>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold mb-1">Win Rate by Opponent Strength</p>
          <p className="text-xs text-muted-foreground mb-4">How you perform against different rating levels</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={strengthData} barSize={60}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Win rate']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="winRate" radius={[6, 6, 0, 0]}>
                {strengthData.map((d, i) => <Cell key={i} fill={d.winRate >= 50 ? 'hsl(var(--chart-2))' : d.winRate >= 40 ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-4))'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ScrollReveal>

      {/* Frequent opponents */}
      {opponents.frequent.length > 0 && (
        <ScrollReveal delay={0.15}>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold mb-4 flex items-center gap-2"><Swords className="h-4 w-4 text-primary" />Most Frequent Opponents</p>
            <div className="space-y-2">
              {opponents.frequent.slice(0, 8).map((opp, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm text-muted-foreground w-6 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{opp.username}</p>
                    <p className="text-xs text-muted-foreground">~{opp.avgRating} rating · {opp.games} games</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{opp.wins}W {opp.losses}L {opp.draws}D</p>
                    <WLBar wins={opp.wins} losses={opp.losses} draws={opp.draws} compact />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Nemeses */}
      {opponents.nemeses.length > 0 && (
        <ScrollReveal delay={0.2}>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
            <p className="text-sm font-semibold mb-4 flex items-center gap-2 text-destructive"><TrendingDown className="h-4 w-4" />Nemeses (Toughest Opponents)</p>
            <div className="space-y-2">
              {opponents.nemeses.map((opp, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-background/40">
                  <div className="flex-1"><p className="text-sm font-medium">{opp.username}</p><p className="text-xs text-muted-foreground">{opp.games} games played</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-destructive">{opp.winRate}% win</p><p className="text-xs text-muted-foreground">{opp.wins}W {opp.losses}L</p></div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
