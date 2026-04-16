
export interface ProfileData {
  username: string;
  title?: string;
  country?: string;
  avatar?: string;
  joinedAt?: number;
  platform: 'lichess' | 'chesscom';
  url: string;
}

export interface RatingData {
  rating: number;
  min: number;
  max: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface OpeningStat {
  name: string;
  eco: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface OpponentStat {
  username: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  avgRating: number;
  winRate: number;
}

export interface RecentGame {
  id: string;
  white: { username: string; rating: number };
  black: { username: string; rating: number };
  result: 'white' | 'black' | 'draw';
  userColor: 'white' | 'black';
  userResult: 'win' | 'loss' | 'draw';
  opening?: string;
  eco?: string;
  timeControl: string;
  speed: string;
  date: number;
  url: string;
  moves?: string;
}

export interface TimeControlStat {
  name: string;
  speed: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  rating: number;
  recentForm: ('win' | 'loss' | 'draw')[];
}

export interface PlayerStats {
  profile: ProfileData;
  overall: {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    gamesThisMonth: number;
    currentStreak: { type: 'win' | 'loss' | 'draw'; count: number };
    longestWinStreak: number;
    longestLossStreak: number;
  };
  ratings: { [format: string]: RatingData };
  colorStats: {
    white: { games: number; wins: number; losses: number; draws: number; winRate: number };
    black: { games: number; wins: number; losses: number; draws: number; winRate: number };
  };
  openings: {
    asWhite: OpeningStat[];
    asBlack: OpeningStat[];
    firstMoves: Array<{ move: string; count: number; winRate: number }>;
  };
  opponents: {
    frequent: OpponentStat[];
    avgOpponentRating: number;
    vsHigherRated: { games: number; wins: number; winRate: number };
    vsLowerRated: { games: number; wins: number; winRate: number };
    vsSimilarRated: { games: number; wins: number; winRate: number };
    nemeses: OpponentStat[];
  };
  recentGames: RecentGame[];
  timeControls: TimeControlStat[];
  dayOfWeek: Array<{ day: string; games: number; wins: number; winRate: number }>;
}

export interface RatingHistoryData {
  [format: string]: Array<{ date: number; rating: number }>;
}

export interface InsightsData {
  overview: string[];
  strengths: string[];
  weaknesses: string[];
  reportCard: {
    openings: { grade: string; explanation: string };
    tactical: { grade: string; explanation: string };
    endgame: { grade: string; explanation: string };
    consistency: { grade: string; explanation: string };
    timeManagement: { grade: string; explanation: string };
  };
  prediction: string;
  openingInsights: string[];
  trendsInsight: string;
}
