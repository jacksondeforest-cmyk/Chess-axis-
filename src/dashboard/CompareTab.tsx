
import { useState } from 'react';
import { fetchPlayerStats } from 'zite-endpoints-sdk';
import type { FetchPlayerStatsOutputType } from 'zite-endpoints-sdk';
import { Search, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScrollReveal from '@/components/ScrollReveal';
import { Skeleton } from '@/components/ui/skeleton';

type Stats = FetchPlayerStatsOutputType['stats'];
interface Props { stats: Stats; username: string; platform: string; }

function WinnerBadge({ side }: { side: 'left' | 'right' | 'tie' }) {
  if (side === 'tie') return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">TIE</span>;
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${side === 'left' ? 'bg-chart-2/15 text-chart-2' : 'bg-destructive/15 text-destructive'}`}>{side === 'left' ? 'BETTER' : 'BETTER'}</span>;
}

function CompareRow({ label, leftVal, rightVal, leftNum, rightNum, higherIsBetter = true }: { label: string; leftVal: string; rightVal: string; leftNum: number; rightNum: number; higherIsBetter?: boolean }) {
  const diff = leftNum - rightNum;
  const leftWins = higherIsBetter ? diff > 0 : diff < 0;
  const tie = Math.abs(diff) < 0.01;
  const leftClass = tie ? '' : leftWins ? 'text-chart-2 font-bold' : 'text-muted-foreground';
  const rightClass = tie ? '' : !leftWins ? 'text-chart-2 font-bold' : 'text-muted-foreground';
  const Icon = tie ? Minus : leftWins ? TrendingUp : TrendingDown;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3 border-b border-border last:border-0">
      <p className={`text-sm text-right tabular-nums ${leftClass}`}>{leftVal}</p>
      <div className="flex flex-col items-center gap-0.5 min-w-[100px]">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <Icon className="h-3 w-3 text-muted-foreground" />
      </div>
      <p className={`text-sm tabular-nums ${rightClass}`}>{rightVal}</p>
    </div>
  );
}

function PlayerHeader({ stats, username }: { stats: Stats; username: string }) {
  const bestRating = Math.max(...Object.values(stats.ratings).map(r => r.rating).filter(r => r > 0), 0);
  const bestFormat = Object.entries(stats.ratings).sort((a, b) => b[1].games - a[1].games)[0]?.[0] || '';
  return (
    <div className="text-center">
      <p className="font-bold text-lg truncate">{username}</p>
      <p className="text-accent font-bold text-2xl tabular-nums">{bestRating}</p>
      <p className="text-xs text-muted-foreground capitalize">{bestFormat}</p>
    </div>
  );
}

export default function CompareTab({ stats, username, platform }: Props) {
  const [otherUser, setOtherUser] = useState('');
  const [otherPlatform, setOtherPlatform] = useState<'lichess' | 'chesscom'>(platform as 'lichess' | 'chesscom');
  const [otherStats, setOtherStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!otherUser.trim()) return;
    setIsLoading(true); setError(''); setOtherStats(null);
    try {
      const r = await fetchPlayerStats({ username: otherUser.trim(), platform: otherPlatform });
      setOtherStats(r.stats);
    } catch (e: any) { setError(e.message || 'Failed to load player'); }
    setIsLoading(false);
  };

  const myBestRating = Math.max(...Object.values(stats.ratings).map(r => r.rating).filter(r => r > 0), 0);
  const theirBestRating = otherStats ? Math.max(...Object.values(otherStats.ratings).map(r => r.rating).filter(r => r > 0), 0) : 0;
  const myTopOpening = stats.openings.asWhite[0];
  const theirTopOpening = otherStats?.openings.asWhite[0];

  return (
    <div className="space-y-5">
      <ScrollReveal>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold text-base mb-4 flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" />Compare Players</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1 p-1 rounded-lg bg-muted shrink-0">
              {(['lichess', 'chesscom'] as const).map(p => (
                <button key={p} onClick={() => setOtherPlatform(p)} className={`px-3 py-1.5 text-xs rounded-md transition-all font-medium ${otherPlatform === p ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>{p === 'lichess' ? 'Lichess' : 'Chess.com'}</button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={otherUser} onChange={e => setOtherUser(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCompare()} placeholder="Enter opponent username…" className="pl-9 bg-muted/50" />
            </div>
            <Button onClick={handleCompare} disabled={isLoading || !otherUser.trim()} className="shrink-0">
              {isLoading ? 'Loading…' : 'Compare'}
            </Button>
          </div>
          {error && <p className="text-destructive text-sm mt-3">{error}</p>}
        </div>
      </ScrollReveal>

      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="shimmer h-10 w-full rounded-lg" />)}
        </div>
      )}

      {otherStats && !isLoading && (
        <ScrollReveal delay={0.1}>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Player headers */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 p-5 bg-muted/30 border-b border-border">
              <PlayerHeader stats={stats} username={username} />
              <div className="text-center text-sm font-bold text-muted-foreground self-center">VS</div>
              <PlayerHeader stats={otherStats} username={otherUser} />
            </div>

            <div className="px-5 py-2">
              <CompareRow label="Win Rate" leftVal={`${stats.overall.winRate}%`} rightVal={`${otherStats.overall.winRate}%`} leftNum={stats.overall.winRate} rightNum={otherStats.overall.winRate} />
              <CompareRow label="Best Rating" leftVal={String(myBestRating)} rightVal={String(theirBestRating)} leftNum={myBestRating} rightNum={theirBestRating} />
              <CompareRow label="Total Games" leftVal={stats.overall.totalGames.toLocaleString()} rightVal={otherStats.overall.totalGames.toLocaleString()} leftNum={stats.overall.totalGames} rightNum={otherStats.overall.totalGames} />
              <CompareRow label="White Win %" leftVal={`${stats.colorStats.white.winRate}%`} rightVal={`${otherStats.colorStats.white.winRate}%`} leftNum={stats.colorStats.white.winRate} rightNum={otherStats.colorStats.white.winRate} />
              <CompareRow label="Black Win %" leftVal={`${stats.colorStats.black.winRate}%`} rightVal={`${otherStats.colorStats.black.winRate}%`} leftNum={stats.colorStats.black.winRate} rightNum={otherStats.colorStats.black.winRate} />
              <CompareRow label="This Month" leftVal={String(stats.overall.gamesThisMonth)} rightVal={String(otherStats.overall.gamesThisMonth)} leftNum={stats.overall.gamesThisMonth} rightNum={otherStats.overall.gamesThisMonth} />
              <CompareRow label="Win Streak" leftVal={String(stats.overall.longestWinStreak)} rightVal={String(otherStats.overall.longestWinStreak)} leftNum={stats.overall.longestWinStreak} rightNum={otherStats.overall.longestWinStreak} />
              <CompareRow label="vs Higher Rated" leftVal={`${stats.opponents.vsHigherRated.winRate}%`} rightVal={`${otherStats.opponents.vsHigherRated.winRate}%`} leftNum={stats.opponents.vsHigherRated.winRate} rightNum={otherStats.opponents.vsHigherRated.winRate} />
              {myTopOpening && theirTopOpening && (
                <div className="py-3 border-b border-border last:border-0">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-center mb-2">Favorite White Opening</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div><p className="text-xs font-medium truncate">{myTopOpening.name}</p><p className="text-xs text-chart-2">{myTopOpening.winRate}%</p></div>
                    <div><p className="text-xs font-medium truncate">{theirTopOpening.name}</p><p className="text-xs text-chart-2">{theirTopOpening.winRate}%</p></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      )}

      {!otherStats && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Trophy className="h-12 w-12 opacity-20 mb-3" />
          <p className="text-sm">Enter a username above to compare stats side-by-side</p>
        </div>
      )}
    </div>
  );
}
