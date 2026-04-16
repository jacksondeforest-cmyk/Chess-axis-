
import { FetchPlayerStatsOutputType, GenerateInsightsOutputType } from 'zite-endpoints-sdk';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import InsightCard from '@/components/InsightCard';
import ScrollReveal from '@/components/ScrollReveal';

type Stats = FetchPlayerStatsOutputType['stats'];
type Insights = GenerateInsightsOutputType['insights'];

function OpeningTable({ openings, color }: { openings: Stats['openings']['asWhite']; color: 'white' | 'black' }) {
  if (openings.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">No opening data available</p>;
  return (
    <div className="space-y-2">
      {openings.slice(0, 8).map((o, i) => (
        <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
          <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">{o.eco}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{o.name}</p>
            <p className="text-xs text-muted-foreground">{o.games} games</p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-sm font-bold ${o.winRate >= 55 ? 'text-chart-2' : o.winRate <= 40 ? 'text-destructive' : 'text-foreground'}`}>{o.winRate}%</p>
            <div className="w-16 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
              <div style={{ width: `${o.winRate}%` }} className={`h-full rounded-full ${o.winRate >= 55 ? 'bg-chart-2' : o.winRate <= 40 ? 'bg-destructive' : 'bg-primary'}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OpeningsTab({ stats, insights }: { stats: Stats; insights: Insights | null }) {
  const { openings } = stats;
  const firstMoveData = openings.firstMoves.slice(0, 5);
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-5))', 'hsl(var(--muted-foreground))'];

  return (
    <div className="space-y-6">
      {/* First moves chart */}
      {firstMoveData.length > 0 && (
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-semibold mb-1">First Move Frequency (White)</p>
              <p className="text-xs text-muted-foreground mb-4">Your most common opening moves</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={firstMoveData} dataKey="count" nameKey="move" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                    {firstMoveData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-semibold mb-1">Win Rate by First Move</p>
              <p className="text-xs text-muted-foreground mb-4">How each opening move performs</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={firstMoveData} barSize={36}>
                  <XAxis dataKey="move" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Win rate']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="winRate" radius={[5, 5, 0, 0]}>
                    {firstMoveData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Opening tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScrollReveal delay={0.1}>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold mb-1 flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-foreground inline-block" />With White</p>
            <p className="text-xs text-muted-foreground mb-3">Top openings as White</p>
            <OpeningTable openings={openings.asWhite} color="white" />
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold mb-1 flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-muted-foreground/60 inline-block border border-border" />With Black</p>
            <p className="text-xs text-muted-foreground mb-3">Top openings as Black</p>
            <OpeningTable openings={openings.asBlack} color="black" />
          </div>
        </ScrollReveal>
      </div>

      {insights?.openingInsights && insights.openingInsights.length > 0 && (
        <ScrollReveal delay={0.2}>
          <InsightCard type="info" title="Opening Insights" insights={insights.openingInsights} />
        </ScrollReveal>
      )}
    </div>
  );
}
