
import { FetchPlayerStatsOutputType } from 'zite-endpoints-sdk';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ExternalLink, Zap, Flame, Clock, Hourglass } from 'lucide-react';
import ChessBoard from '@/components/ChessBoard';
import ScrollReveal from '@/components/ScrollReveal';

type Stats = FetchPlayerStatsOutputType['stats'];
type Game = Stats['recentGames'][0];

const SPEED_ICONS: Record<string, React.ReactNode> = {
  bullet: <Zap className="h-3 w-3" />,
  blitz: <Flame className="h-3 w-3" />,
  rapid: <Clock className="h-3 w-3" />,
  classical: <Hourglass className="h-3 w-3" />,
};

function ResultBadge({ result }: { result: 'win' | 'loss' | 'draw' }) {
  const cfg = { win: 'bg-chart-2/15 text-chart-2 border-chart-2/25', loss: 'bg-destructive/15 text-destructive border-destructive/25', draw: 'bg-muted text-muted-foreground border-border' };
  const label = { win: 'Win', loss: 'Loss', draw: 'Draw' };
  return <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold ${cfg[result]}`}>{label[result]}</span>;
}

function GameRow({ game, isExpanded, onToggle }: { game: Game; isExpanded: boolean; onToggle: () => void }) {
  const opponent = game.userColor === 'white' ? game.black : game.white;
  const date = new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left">
        <ResultBadge result={game.userResult} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{opponent.username}</span>
            <span className="text-xs text-muted-foreground">({opponent.rating})</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1">{SPEED_ICONS[game.speed] || <Clock className="h-3 w-3" />}{game.speed}</span>
            {game.opening && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{game.opening}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">{date}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
            <div className="border-t border-border p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {game.moves ? (
                  <div className="w-full sm:w-72 shrink-0">
                    <ChessBoard moves={game.moves} />
                  </div>
                ) : (
                  <div className="w-full sm:w-72 shrink-0 flex items-center justify-center h-48 bg-muted/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">No move data</p>
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/40"><p className="text-xs text-muted-foreground">White</p><p className="font-semibold text-sm">{game.white.username} ({game.white.rating})</p></div>
                    <div className="p-3 rounded-lg bg-muted/40"><p className="text-xs text-muted-foreground">Black</p><p className="font-semibold text-sm">{game.black.username} ({game.black.rating})</p></div>
                    {game.opening && <div className="p-3 rounded-lg bg-muted/40 col-span-2"><p className="text-xs text-muted-foreground">Opening</p><p className="font-medium text-sm">{game.eco && <span className="text-primary font-mono mr-1">{game.eco}</span>}{game.opening}</p></div>}
                    <div className="p-3 rounded-lg bg-muted/40"><p className="text-xs text-muted-foreground">Date</p><p className="font-medium text-sm">{new Date(game.date).toLocaleDateString()}</p></div>
                    <div className="p-3 rounded-lg bg-muted/40"><p className="text-xs text-muted-foreground">Time control</p><p className="font-medium text-sm capitalize">{game.speed}</p></div>
                  </div>
                  <a href={game.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><ExternalLink className="h-3 w-3" />View on {game.url.includes('lichess') ? 'Lichess' : 'Chess.com'}</a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RecentGamesTab({ stats }: { stats: Stats }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { recentGames } = stats;

  if (recentGames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">♟</div>
        <h3 className="text-lg font-semibold mb-2">No recent games</h3>
        <p className="text-muted-foreground text-sm">Play some games and come back!</p>
      </div>
    );
  }

  const wins = recentGames.filter(g => g.userResult === 'win').length;
  const losses = recentGames.filter(g => g.userResult === 'loss').length;
  const draws = recentGames.filter(g => g.userResult === 'draw').length;

  return (
    <div className="space-y-4">
      <ScrollReveal>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <div className="text-center"><p className="text-lg font-bold text-chart-2">{wins}</p><p className="text-xs text-muted-foreground">Wins</p></div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center"><p className="text-lg font-bold text-destructive">{losses}</p><p className="text-xs text-muted-foreground">Losses</p></div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center"><p className="text-lg font-bold text-muted-foreground">{draws}</p><p className="text-xs text-muted-foreground">Draws</p></div>
          <div className="flex-1 ml-2">
            <div className="flex h-2 rounded-full overflow-hidden bg-muted">
              <div style={{ width: `${(wins / recentGames.length) * 100}%` }} className="bg-chart-2" />
              <div style={{ width: `${(draws / recentGames.length) * 100}%` }} className="bg-muted-foreground/40" />
              <div style={{ width: `${(losses / recentGames.length) * 100}%` }} className="bg-destructive" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last {recentGames.length} games</p>
          </div>
        </div>
      </ScrollReveal>

      <div className="space-y-2">
        {recentGames.map((game, i) => (
          <ScrollReveal key={game.id} delay={Math.min(i * 0.03, 0.3)}>
            <GameRow game={game} isExpanded={expandedId === game.id} onToggle={() => setExpandedId(expandedId === game.id ? null : game.id)} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
