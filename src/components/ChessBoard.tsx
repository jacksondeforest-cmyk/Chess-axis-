
import { useState, useEffect, useCallback } from 'react';
import { getPositions, ChessState } from '@/lib/chess';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface ChessBoardProps {
  moves: string;
  className?: string;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Lichess cburnett piece SVGs — clean, professional look
const getPieceSrc = (color: 'w' | 'b', type: string) =>
  `https://lichess1.org/assets/piece/cburnett/${color}${type.toUpperCase()}.svg`;

function getChangedSquares(prev: ChessState, curr: ChessState): Set<string> {
  const changed = new Set<string>();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = prev.board[r][c], n = curr.board[r][c];
      if (JSON.stringify(p) !== JSON.stringify(n)) changed.add(`${r},${c}`);
    }
  }
  return changed;
}

export default function ChessBoard({ moves, className = '' }: ChessBoardProps) {
  const moveList = moves ? moves.trim().split(/\s+/).filter(Boolean) : [];
  const [positions] = useState(() => getPositions(moveList));
  const [idx, setIdx] = useState(0);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1));
    if (e.key === 'ArrowRight') setIdx(i => Math.min(positions.length - 1, i + 1));
  }, [positions.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const state = positions[idx];
  const highlighted = idx > 0 ? getChangedSquares(positions[idx - 1], state) : new Set<string>();

  return (
    <div className={className}>
      <div className="relative select-none rounded-lg overflow-hidden border-2 border-border shadow-lg w-full">
        <div className="grid grid-cols-8 w-full">
          {state.board.map((row, rIdx) =>
            row.map((piece, cIdx) => {
              const isLight = (rIdx + cIdx) % 2 === 0;
              const isHighlighted = highlighted.has(`${rIdx},${cIdx}`);
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="aspect-square flex items-center justify-center relative"
                  style={{
                    background: isHighlighted
                      ? 'hsl(60 90% 55% / 0.55)'
                      : isLight
                      ? 'hsl(var(--chess-light))'
                      : 'hsl(var(--chess-dark))',
                  }}
                >
                  {/* Coordinate labels */}
                  {cIdx === 0 && (
                    <span className="absolute top-0.5 left-0.5 text-[8px] font-bold opacity-50 leading-none" style={{ color: isLight ? 'hsl(var(--chess-dark))' : 'hsl(var(--chess-light))' }}>
                      {RANKS[rIdx]}
                    </span>
                  )}
                  {rIdx === 7 && (
                    <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold opacity-50 leading-none" style={{ color: isLight ? 'hsl(var(--chess-dark))' : 'hsl(var(--chess-light))' }}>
                      {FILES[cIdx]}
                    </span>
                  )}
                  {/* SVG Piece */}
                  {piece && (
                    <img
                      src={getPieceSrc(piece.color, piece.type)}
                      alt={`${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}`}
                      className="w-[88%] h-[88%] object-contain"
                      draggable={false}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-3 gap-2">
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIdx(0)} disabled={idx === 0}>
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
        <span className="text-xs text-muted-foreground font-mono text-center flex-1">
          {idx > 0
            ? `${Math.ceil(idx / 2)}${idx % 2 !== 0 ? '.' : '...'} ${state.moveHistory[idx - 1]}`
            : 'Start'}
          {' '}({idx}/{moveList.length})
        </span>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIdx(i => Math.min(positions.length - 1, i + 1))} disabled={idx === positions.length - 1}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIdx(positions.length - 1)} disabled={idx === positions.length - 1}>
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-1 opacity-60">Use ← → arrow keys to navigate</p>
    </div>
  );
}
