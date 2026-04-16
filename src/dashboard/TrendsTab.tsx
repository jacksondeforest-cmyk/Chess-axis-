
import { FetchPlayerStatsOutputType, FetchRatingHistoryOutputType, GenerateInsightsOutputType } from 'zite-endpoints-sdk';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import InsightCard from '@/components/InsightCard';
import ScrollReveal from '@/components/ScrollReveal';
import { Skeleton } from '@/components/ui/skeleton';

type Stats = FetchPlayerStatsOutputType['stats'];
type History = FetchRatingHistoryOutputType['history'];
type Insights = GenerateInsightsOutputType['insights'];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-5))'];
const TIME_RANGES = ['3m', '6m', '12m', 'All'] as const;

export default function TrendsTab({ stats, ratingHistory, insights }: { stats: Stats; ratingHistory: History | null; insights: Insights | null }) {
  const [timeRange, setTimeRange] = useState<typeof TIME_RANGES[number]>('6m');

  const filterByRange = (points: Array<{ date: number; rating: number }>) => {
    const now = Date.now();
    const cutoffs: Record<string, number> = { '3m': 90, '6m': 180, '12m': 365, 'All': 9999 };
    const cutoff = now - (cutoffs[timeRange] || 180) * 24 * 3600 * 1000;
    return points.filter(p => p.date > cutoff);
  };

  const chartData = ratingHistory ? (() => {
    const formats = Object.keys(ratingHistory).filter(k => ['bullet', 'blitz', 'rapid', 'classical'].includes(k));
    const allDates = new Set<string>();
    const byDate: Record<string, Record<string, number>> = {};
    for (const fmt of formats) {
      for (const p of filterByRange(ratingHistory[fmt] || [])) {
        const d = new Date(p.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        allDates.add(d);
        if (!byDate[d]) byDate[d] = {};
        byDate[d][fmt] = p.rating;
      }
    }
    return { dates: [...allDates].sort(), byDate, formats };
  })() : null;

  const mergedPoints = chartData ? chartData.dates.map(d => ({ date: d, ...chartData.byDate[d] })) : [];

  const dayData = stats.dayOfWeek;

  return (
    <div className="space-y-6">
      {/* Rating history */}
      <ScrollReveal>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <p className="text-sm font-semibold">Rating Progression</p>
              <p className="text-xs text-muted-foreground">Historical rating across time controls</p>
            </div>
            <div className="flex gap-1 p-1 rounded-lg bg-muted">
              {TIME_RANGES.map(r => (
                <button key={r} onClick={() => setTimeRange(r)} className={`px-3 py-1 text-xs rounded-md transition-all ${timeRange === r ? 'bg-card font-semibold shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{r}</button>
              ))}
            </div>
          </div>
          {!ratingHistory ? (
            <Skeleton className="shimmer h-56 w-full rounded-lg" />
          ) : mergedPoints.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">No rating history available for this period</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={mergedPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                {chartData?.formats.map((fmt, i) => (
                  <Line key={fmt} type="monotone" dataKey={fmt} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} connectNulls name={fmt.charAt(0).toUpperCase() + fmt.slice(1)} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </ScrollReveal>

      {/* Day of week heatmap */}
      <ScrollReveal delay={0.1}>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold mb-1">Performance by Day of Week</p>
          <p className="text-xs text-muted-foreground mb-4">When you play best</p>
          <div className="grid grid-cols-7 gap-2">
            {dayData.map(d => {
              const intensity = d.games > 0 ? d.winRate / 100 : 0;
              return (
                <div key={d.day} className="flex flex-col items-center gap-1">
                  <div className="w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:scale-105" style={{ background: d.games > 0 ? `hsl(var(--chart-2) / ${0.1 + intensity * 0.7})` : 'hsl(var(--muted))', color: intensity > 0.5 ? 'hsl(var(--chart-2))' : 'hsl(var(--muted-foreground))' }}>
                    {d.games > 0 ? `${Math.round(d.winRate)}%` : '–'}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  <span className="text-[10px] text-muted-foreground/60">{d.games}g</span>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Activity chart */}
      <ScrollReveal delay={0.15}>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold mb-1">Time Control Distribution</p>
          <p className="text-xs text-muted-foreground mb-4">Games played by format</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.timeControls.filter(t => t.games > 0)} barSize={40}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="games" radius={[5, 5, 0, 0]}>
                {stats.timeControls.map((_, i) => <Cell key={i} fill={`hsl(var(--chart-${(i % 5) + 1}))`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ScrollReveal>

      {insights && (
        <ScrollReveal delay={0.2}>
          <InsightCard type="prediction" title="Trend Analysis" insights={[insights.trendsInsight, insights.prediction].filter(Boolean)} />
        </ScrollReveal>
      )}
    </div>
  );
}
