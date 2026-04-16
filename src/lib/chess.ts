
export type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
export type Color = 'w' | 'b';
export type Piece = { type: PieceType; color: Color };
export type Board = (Piece | null)[][];

export interface ChessState {
  board: Board;
  turn: Color;
  enPassant: [number, number] | null;
  castling: { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean };
  moveHistory: string[];
}

const START_BOARD: Board = [
  [{ type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' }, { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }],
  [{ type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [{ type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }],
  [{ type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' }, { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }],
];

export const INITIAL_STATE: ChessState = {
  board: START_BOARD.map(row => [...row]),
  turn: 'w',
  enPassant: null,
  castling: { wK: true, wQ: true, bK: true, bQ: true },
  moveHistory: [],
};

function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

function hasBlocker(board: Board, fr: number, fc: number, tr: number, tc: number): boolean {
  const dr = Math.sign(tr - fr), dc = Math.sign(tc - fc);
  let r = fr + dr, c = fc + dc;
  while (r !== tr || c !== tc) {
    if (board[r][c]) return true;
    r += dr; c += dc;
  }
  return false;
}

function canReach(board: Board, fr: number, fc: number, tr: number, tc: number, ep: [number, number] | null): boolean {
  const piece = board[fr][fc];
  if (!piece) return false;
  const dr = tr - fr, dc = tc - fc;
  const target = board[tr][tc];
  if (target && target.color === piece.color) return false;

  switch (piece.type) {
    case 'p': {
      const dir = piece.color === 'w' ? -1 : 1;
      const startRow = piece.color === 'w' ? 6 : 1;
      if (dc === 0 && dr === dir && !target) return true;
      if (dc === 0 && dr === 2 * dir && fr === startRow && !board[fr + dir][fc] && !target) return true;
      if (Math.abs(dc) === 1 && dr === dir) {
        if (target) return true;
        if (ep && tr === ep[0] && tc === ep[1]) return true;
      }
      return false;
    }
    case 'n': return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
    case 'b': return Math.abs(dr) === Math.abs(dc) && dr !== 0 && !hasBlocker(board, fr, fc, tr, tc);
    case 'r': return (dr === 0 || dc === 0) && !(dr === 0 && dc === 0) && !hasBlocker(board, fr, fc, tr, tc);
    case 'q': {
      const isDiag = Math.abs(dr) === Math.abs(dc) && dr !== 0;
      const isOrtho = (dr === 0 || dc === 0) && !(dr === 0 && dc === 0);
      return (isDiag || isOrtho) && !hasBlocker(board, fr, fc, tr, tc);
    }
    case 'k': return Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0);
    default: return false;
  }
}

export function applyMove(state: ChessState, san: string): ChessState {
  const clean = san.replace(/[+#!?x]/g, (m) => m === 'x' ? 'x' : '').replace(/\s/g, '');
  const move = clean.replace(/[+#!?]/g, '');
  const color = state.turn;
  const newBoard = cloneBoard(state.board);
  let castling = { ...state.castling };
  let newEp: [number, number] | null = null;

  if (move === 'O-O' || move === '0-0') {
    const row = color === 'w' ? 7 : 0;
    newBoard[row][6] = { type: 'k', color }; newBoard[row][5] = { type: 'r', color };
    newBoard[row][4] = null; newBoard[row][7] = null;
    if (color === 'w') { castling.wK = false; castling.wQ = false; } else { castling.bK = false; castling.bQ = false; }
    return { board: newBoard, turn: color === 'w' ? 'b' : 'w', enPassant: null, castling, moveHistory: [...state.moveHistory, san] };
  }
  if (move === 'O-O-O' || move === '0-0-0') {
    const row = color === 'w' ? 7 : 0;
    newBoard[row][2] = { type: 'k', color }; newBoard[row][3] = { type: 'r', color };
    newBoard[row][4] = null; newBoard[row][0] = null;
    if (color === 'w') { castling.wK = false; castling.wQ = false; } else { castling.bK = false; castling.bQ = false; }
    return { board: newBoard, turn: color === 'w' ? 'b' : 'w', enPassant: null, castling, moveHistory: [...state.moveHistory, san] };
  }

  const m = move.replace(/x/g, '').match(/^([KQRBN]?)([a-h]?)([1-8]?)([a-h][1-8])(?:=?([QRBNqrbn]))?$/);
  if (!m) return state;
  const [, pc, fh, rh, dest, promo] = m;
  const pt = (pc || 'p').toLowerCase() as PieceType;
  const toC = dest.charCodeAt(0) - 97, toR = 8 - parseInt(dest[1]);

  let fromR = -1, fromC = -1;
  outer: for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (!p || p.color !== color || p.type !== pt) continue;
      if (fh && c !== fh.charCodeAt(0) - 97) continue;
      if (rh && r !== 8 - parseInt(rh)) continue;
      if (canReach(state.board, r, c, toR, toC, state.enPassant)) { fromR = r; fromC = c; break outer; }
    }
  }
  if (fromR === -1) return state;

  const mp = state.board[fromR][fromC]!;
  if (mp.type === 'p' && state.enPassant && toR === state.enPassant[0] && toC === state.enPassant[1]) {
    newBoard[fromR][toC] = null;
  }
  if (mp.type === 'p' && Math.abs(toR - fromR) === 2) newEp = [(fromR + toR) / 2, fromC];

  newBoard[toR][toC] = promo ? { type: promo.toLowerCase() as PieceType, color } : mp;
  newBoard[fromR][fromC] = null;

  if (mp.type === 'k') {
    if (color === 'w') { castling.wK = false; castling.wQ = false; } else { castling.bK = false; castling.bQ = false; }
  }
  if (mp.type === 'r') {
    if (fromR === 7 && fromC === 7) castling.wK = false;
    if (fromR === 7 && fromC === 0) castling.wQ = false;
    if (fromR === 0 && fromC === 7) castling.bK = false;
    if (fromR === 0 && fromC === 0) castling.bQ = false;
  }

  return { board: newBoard, turn: color === 'w' ? 'b' : 'w', enPassant: newEp, castling, moveHistory: [...state.moveHistory, san] };
}

export function getPositions(moves: string[]): ChessState[] {
  const init: ChessState = { board: START_BOARD.map(r => [...r]), turn: 'w', enPassant: null, castling: { wK: true, wQ: true, bK: true, bQ: true }, moveHistory: [] };
  const states: ChessState[] = [init];
  let cur = init;
  for (const mv of moves) {
    cur = applyMove(cur, mv);
    states.push(cur);
  }
  return states;
}

export const PIECE_UNICODE: Record<Color, Record<PieceType, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};
