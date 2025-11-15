-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    bankroll DECIMAL(10, 2) DEFAULT 1000.00 NOT NULL,
    total_hands_played INTEGER DEFAULT 0,
    hands_won INTEGER DEFAULT 0,
    hands_lost INTEGER DEFAULT 0,
    biggest_win DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_history table
CREATE TABLE IF NOT EXISTS game_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    bet_amount DECIMAL(10, 2) NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'push', 'blackjack')),
    payout DECIMAL(10, 2) NOT NULL,
    bankroll_after DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

-- Players table policies
-- Users can read their own player data
CREATE POLICY "Users can read own player data"
    ON players FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own player data
CREATE POLICY "Users can update own player data"
    ON players FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can insert their own player data
CREATE POLICY "Users can insert own player data"
    ON players FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Public can read all players for leaderboard (no sensitive data exposed)
CREATE POLICY "Public can read players for leaderboard"
    ON players FOR SELECT
    USING (true);

-- Game history policies
-- Users can read their own game history
CREATE POLICY "Users can read own game history"
    ON game_history FOR SELECT
    USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Users can insert their own game history
CREATE POLICY "Users can insert own game history"
    ON game_history FOR INSERT
    WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_bankroll ON players(bankroll DESC);
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_game_history_player_id ON game_history(player_id);
CREATE INDEX IF NOT EXISTS idx_game_history_created_at ON game_history(created_at DESC);

-- Enable realtime for leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE players;
