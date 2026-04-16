
import { useState } from 'react';
import { fetchPlayerStats } from 'zite-endpoints-sdk';
import type { FetchPlayerStatsOutputType } from 'zite-endpoints-sdk';
import { Search, Swords, AlertTriangle, Shield, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScrollReveal from '@/components/ScrollReveal';
import { Skeleton } from '@/components/ui/skeleton';

type Stats = FetchPlayerStatsOutputType['stats'];

function OpeningRow({ opening, idx }: { opening: any; idx: number }) {
  const wr = opening.winRate;
  const color = wr >= 60 ? 'text-chart-2' : wr <= 40 ? 'text-destructive' : 'text-foreground';
  const threat = wr >= 60;
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 hover:bg-muted/40 rounded-lg transition-colors">
      <span className="text-xs text-muted-foreground w-5 text-right">{idx + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{opening.name}</p>
        <p className="text-xs text-muted-foreground">{opening.eco} · {opening.games} games</p>
      </div>
      {threat && <AlertTriangle className="h-3.5 w-3.5 text-accent shrink-0" />}
      <span className={`text-sm font-bold tabular-nums shrink-0 ${color}`}>{wr}%</span>
    </div>
  );
}

export default function OpponentScoutTab() {
  const [inputUser, setInputUser] = useState('');
  const [platform, setPlatform] = useState<'lichess' | 'chesscom'>('lichess');
  const [scoutedStats, setScoutedStats] = useState<Stats | null>(null);
  const [scoutedName, setScoutedName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScout = async () => {
    if (!inputUser.trim()) return;
    setIsLoading(true); setError(''); setScoutedStats(null);
    try {
      const r = await fetchPlayerStats({ username: inputUser.trim(), platform });
      setScoutedStats(r.stats);
      setScoutedName(r.stats.profile.username);
    } catch (e: any) { setError(e.message || 'Player not found'); }
    setIsLoading(false);
  };

  const vulnerabilities = scoutedStats
    ? [...scoutedStats.openings.asWhite, ...scoutedStats.openings.asBlack]
        .filter(o => o.games >= 3 && o.winRate <= 42)
        .sort((a, b) => a.winRate - b.winRate)
        .slice(0, 5)
    : [];

  const strongSuits = scoutedStats
    ? [...scoutedStats.openings.asWhite, ...scoutedStats.openings.asBlack]
        .filter(o => o.games >= 3 && o.winRate >= 60)
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 5)
    : [];

  const bestDay = scoutedStats ? [...scoutedStats.dayOfWeek].filter(d => d.games > 2).sort((a, b) => b.winRate - a.winRate)[0] : null;
  const worstDay = scoutedStats ? [...scoutedStats.dayOfWeek].filter(d => d.games > 2).sort((a, b) => a.winRate - b.winRate)[0] : null;
  const bestFormat = scoutedStats ? [...scoutedStats.timeControls].sort((a, b) => b.winRate - a.winRate)[0] : null;
  const weakFormat = scoutedStats ? [...scoutedStats.timeControls].filter(t => t.games >= 10).sort((a, b) => a.winRate - b.winRate)[0] : null;

  return (
    <div className="space-y-5">
      {/* Search */}
      <ScrollReveal>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold text-base mb-4 flex items-center gap-2"><Swords className="h-4 w-4 text-primary" />Opponent Scout</h3>
          <p className="text-xs text-muted-foreground mb-4">Look up any player to see their tendencies, vulnerabilities, and patterns.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1 p-1 rounded-lg bg-muted shrink-0">
              {(['lichess', 'chesscom'] as const).map(p => (
                <button key={p} onClick={() => setPlatform(p)} className={`px-3 py-1.5 text-xs rounded-md transition-all font-medium ${platform === p ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>{p === 'lichess' ? 'Lichess' : 'Chess.com'}</button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={inputUser} onChange={e => setInputUser(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleScout()} placeholder="Enter opponent username…" className="pl-9 bg-muted/50" />
            </div>
            <Button onClick={handleScout} disabled={isLoading || !inputUser.trim()} className="shrink-0 gap-2">
              <Swords className="h-4 w-4" />{isLoading ? 'Scouting…' : 'Scout'}
            </Button>
          </div>
          {error && <p className="text-destructive text-sm mt-3">{error}</p>}
        </div>
      </ScrollReveal>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5"><Skeleton className="shimmer h-4 w-32 mb-4" />{Array.from({ length: 5 }).map((_, j) => <Skeleton key={j} className="shimmer h-8 w-full rounded mb-2" />)}</div>
          ))}
        </div>
      )}

      {scoutedStats && !isLoading && (
        <>
          {/* Overview */}
          <ScrollReveal>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex flex-wrap gap-4 items-center">
                <div><p className="text-lg font-bold">{scoutedName}</p><p className="text-xs text-muted-foreground capitalize">{scoutedStats.profile.platform}</p></div>
                <div className="h-8 w-px bg-border hidden sm:block" />
                {[
                  { label: 'Win Rate', val: `${scoutedStats.overall.winRate}%` },
                  { label: 'Total Games', val: scoutedStats.overall.totalGames.toLocaleString() },
                  { label: 'Best Rating', val: Math.max(...Object.values(scoutedStats.ratings).map(r => r.rating).filter(r => r > 0), 0) },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-xl font-bold gradient-text">{s.val}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Patterns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Strongest format', val: bestFormat?.name || '—', sub: `${bestFormat?.winRate}% win rate`, icon: <Shield className="h-4 w-4 text-chart-2" />, color: 'border-chart-2/20 bg-chart-2/5' },
              { label: 'Weakest format', val: weakFormat?.name || '—', sub: `${weakFormat?.winRate}% win rate`, icon: <Target className="h-4 w-4 text-destructive" />, color: 'border-destructive/20 bg-destructive/5' },
              { label: 'Best day to face them', val: worstDay?.day || '—', sub: `They win ${worstDay?.winRate}%`, icon: <AlertTriangle className="h-4 w-4 text-accent" />, color: 'border-accent/20 bg-accent/5' },
              { label: 'Avoid playing on', val: bestDay?.day || '—', sub: `They win ${bestDay?.winRate}%`, icon: <Swords className="h-4 w-4 text-chart-5" />, color: 'border-chart-5/20 bg-chart-5/5' },
            ].map((card, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className={`rounded-xl border ${card.color} p-4`}>
                  <div className="flex items-center gap-2 mb-1">{card.icon}<p className="text-xs text-muted-foreground">{card.label}</p></div>
                  <p className="font-bold">{card.val}</p>
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vulnerabilities */}
            <ScrollReveal delay={0.1}>
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 shadow-sm">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2 text-destructive"><Target className="h-4 w-4" />Vulnerabilities — openings where they struggle</p>
                {vulnerabilities.length === 0 ? <p className="text-xs text-muted-foreground py-4 text-center">No clear weaknesses found (min. 3 games)</p> : vulnerabilities.map((o, i) => <OpeningRow key={i} opening={o} idx={i} />)}
              </div>
            </ScrollReveal>

            {/* Danger zones */}
            <ScrollReveal delay={0.15}>
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 shadow-sm">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2 text-accent"><AlertTriangle className="h-4 w-4" />Watch out — their strongest openings</p>
                {strongSuits.length === 0 ? <p className="text-xs text-muted-foreground py-4 text-center">No dominant openings found (min. 3 games)</p> : strongSuits.map((o, i) => <OpeningRow key={i} opening={o} idx={i} />)}
              </div>
            </ScrollReveal>

            {/* Their White openings */}
            <ScrollReveal delay={0.2}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold mb-3">Their White Openings</p>
                {scoutedStats.openings.asWhite.slice(0, 6).map((o, i) => <OpeningRow key={i} opening={o} idx={i} />)}
              </div>
            </ScrollReveal>

            {/* Their Black openings */}
            <ScrollReveal delay={0.25}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold mb-3">Their Black Openings</p>
                {scoutedStats.openings.asBlack.slice(0, 6).map((o, i) => <OpeningRow key={i} opening={o} idx={i} />)}
              </div>
            </ScrollReveal>
          </div>
        </>
      )}

      {!scoutedStats && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Swords className="h-12 w-12 opacity-20 mb-3" />
          <p className="text-sm">Enter an opponent username to scout their tendencies and find their weaknesses</p>
        </div>
      )}
    </div>
  );
}
