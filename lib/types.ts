export interface Player {
  id: string;
  user_id: string;
  username: string;
  bankroll: number;
  total_hands_played: number;
  hands_won: number;
  hands_lost: number;
  biggest_win: number;
  created_at: string;
}

export interface GameHistory {
  id: string;
  player_id: string;
  bet_amount: number;
  result: 'win' | 'loss' | 'push' | 'blackjack';
  payout: number;
  bankroll_after: number;
  created_at: string;
}

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  value: number;
}

export interface GameState {
  deck: Card[];
  playerHands: Card[][];
  dealerHand: Card[];
  currentHandIndex: number;
  bets: number[];
  gamePhase: 'betting' | 'dealing' | 'player-turn' | 'dealer-turn' | 'finished';
  playerBankroll: number;
  insuranceBet?: number;
  canDouble: boolean[];
  canSplit: boolean[];
  handResults: ('playing' | 'win' | 'loss' | 'push' | 'blackjack' | 'bust')[];
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  bankroll: number;
  total_hands_played: number;
  hands_won: number;
  hands_lost: number;
  biggest_win: number;
  win_rate: number;
}

export type Database = {
  public: {
    Tables: {
      players: {
        Row: Player;
        Insert: Omit<Player, 'id' | 'created_at'>;
        Update: Partial<Omit<Player, 'id' | 'created_at'>>;
      };
      game_history: {
        Row: GameHistory;
        Insert: Omit<GameHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<GameHistory, 'id' | 'created_at'>>;
      };
    };
  };
};
