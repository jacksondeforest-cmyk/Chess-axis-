
import { useState, useEffect } from 'react';
import { fetchOpeningTree } from 'zite-endpoints-sdk';
import { FetchPlayerStatsOutputType } from 'zite-endpoints-sdk';
import { ChevronRight, ArrowLeft, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ScrollReveal from '@/components/ScrollReveal';

type Stats = FetchPlayerStatsOutputType['stats'];
type TreeData = Record<string, any>;

interface Props { stats: Stats; username: string; platform: string; }

function getAtPath(tree: TreeData, path: string[]): TreeData {
  let node = tree;
  for (const mv of path) { if (node[mv]) node = node[mv].children || {}; else return {}; }
  return node;
}
function getNodeAtPath(tree: TreeData, path: string[]): any | null {
  if (!path.length) return null;
  let node = tree;
  for (let i = 0; i < path.length - 1; i++) { if (node[path[i]]) node = node[path[i]].children || {}; else return null; }
  return node[path[path.length - 1]] || null;
}
function fmtMove(mv: string, idx: number) { return idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}.${mv}` : `${Math.floor(idx / 2) + 1}...${mv}`; }

function WinBar({ winRate, wins, losses, draws }: { winRate: number; wins: number; losses: number; draws: number }) {
  const total = wins + losses + draws;
  return (
    <div className="flex rounded-full overflow-hidden h-1.5 w-20 bg-muted shrink-0">
      <div style={{ width: `${(wins / total) * 100}%` }} className="bg-chart-2" />
      <div style={{ width: `${(draws / total) * 100}%` }} className="bg-muted-foreground/40" />
      <div style={{ width: `${(losses / total) * 100}%` }} className="bg-destructive" />
    </div>
  );
}

export default function OpeningExplorerTab({ stats, username, platform }: Props) {
  const [color, setColor] = useState<'white' | 'black'>('white');
  const [path, setPath] = useState<string[]>([]);
  const [tree, setTree] = useState<TreeData | null>(null);
  const [totalGames, setTotalGames] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadTree = async (c: 'white' | 'black') => {
    setIsLoading(true); setPath([]); setTree(null);
    try {
      const r = await fetchOpeningTree({ username, platform: platform as 'lichess' | 'chesscom', color: c });
      setTree(r.tree); setTotalGames(r.totalGames);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => { loadTree(color); }, []);

  const currentLevel = tree ? getAtPath(tree, path) : {};
  const moveOptions = Object.values(currentLevel).sort((a: any, b: any) => b.games - a.games).slice(0, 25);
  const currentNode = getNodeAtPath(tree || {}, path);
  const isUserTurn = color === 'white' ? path.length % 2 === 0 : path.length % 2 === 1;

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <ScrollReveal>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Opening Explorer
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{totalGames} games analyzed · click any move to explore deeper</p>
            </div>
            <div className="flex gap-1 p-1 rounded-lg bg-muted">
              {(['white', 'black'] as const).map(c => (
                <button key={c} onClick={() => { setColor(c); loadTree(c); }} className={`px-4 py-1.5 text-sm rounded-md transition-all font-medium ${color === c ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
                  {c === 'white' ? '♔ White' : '♚ Black'}
                </button>
              ))}
            </div>
          </div>

          {/* Breadcrumb path */}
          <div className="flex items-center gap-1 flex-wrap min-h-[28px]">
            <button onClick={() => setPath([])} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">Start</button>
            {path.map((mv, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <button onClick={() => setPath(path.slice(0, i + 1))} className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors font-mono font-medium">
                  {fmtMove(mv, i)}
                </button>
              </span>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Current position stats */}
      {currentNode && (
        <ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Games', val: currentNode.games.toLocaleString() },
              { label: 'Win Rate', val: `${currentNode.winRate}%`, color: currentNode.winRate >= 55 ? 'text-chart-2' : currentNode.winRate <= 40 ? 'text-destructive' : '' },
              { label: 'Wins', val: currentNode.wins, color: 'text-chart-2' },
              { label: 'Losses', val: currentNode.losses, color: 'text-destructive' },
            ].map((s, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3 text-center">
                <p className={`text-xl font-bold tabular-nums ${s.color || ''}`}>{s.val}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* Move list */}
      <ScrollReveal delay={0.1}>
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
            <span className="text-sm font-semibold">
              {isUserTurn ? '⚡ Your moves' : '↩ Opponent responses'} at depth {path.length + 1}
            </span>
            {path.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setPath(p => p.slice(0, -1))} className="gap-1.5 h-7 text-xs">
                <ArrowLeft className="h-3 w-3" /> Back
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="shimmer h-10 w-full rounded-lg" />)}</div>
          ) : moveOptions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {tree ? 'No further moves in this line (minimum 2 games required)' : 'Loading opening data…'}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {moveOptions.map((node: any, i: number) => {
                const wr = node.winRate;
                const wrColor = wr >= 55 ? 'text-chart-2' : wr <= 40 ? 'text-destructive' : 'text-foreground';
                return (
                  <button key={node.move} onClick={() => setPath(p => [...p, node.move])} className="w-full flex items-center gap-4 px-5 py-3 hover:bg-muted/40 transition-colors text-left group">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}</span>
                    <span className="font-mono font-bold text-sm flex-1">{fmtMove(node.move, path.length)}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{node.games}g</span>
                    <WinBar winRate={wr} wins={node.wins} losses={node.losses} draws={node.draws} />
                    <span className={`text-sm font-bold w-12 text-right shrink-0 tabular-nums ${wrColor}`}>{wr}%</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
