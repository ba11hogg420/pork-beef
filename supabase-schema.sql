-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    bankroll DECIMAL(10, 2) DEFAULT 1000.00 NOT NULL CHECK (bankroll >= 0),
    total_hands_played INTEGER DEFAULT 0 CHECK (total_hands_played >= 0),
    hands_won INTEGER DEFAULT 0 CHECK (hands_won >= 0),
    hands_lost INTEGER DEFAULT 0 CHECK (hands_lost >= 0),
    biggest_win DECIMAL(10, 2) DEFAULT 0.00 CHECK (biggest_win >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on wallet_address for fast lookups
CREATE INDEX IF NOT EXISTS idx_players_wallet_address ON players(wallet_address);

-- Create game_history table
CREATE TABLE IF NOT EXISTS game_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    bet_amount DECIMAL(10, 2) NOT NULL CHECK (bet_amount > 0),
    result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'push', 'blackjack')),
    payout DECIMAL(10, 2) NOT NULL CHECK (payout >= 0),
    bankroll_after DECIMAL(10, 2) NOT NULL CHECK (bankroll_after >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (prevents duplicate errors)
DROP POLICY IF EXISTS "Users can read own player data" ON players;
DROP POLICY IF EXISTS "Users can update own player data" ON players;
DROP POLICY IF EXISTS "Users can insert own player data" ON players;
DROP POLICY IF EXISTS "Public can read players for leaderboard" ON players;
DROP POLICY IF EXISTS "Users can read own game history" ON game_history;
DROP POLICY IF EXISTS "Users can insert own game history" ON game_history;

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

-- Enable realtime for leaderboard updates (skip if already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'players'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE players;
    END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add additional security: Prevent modification of created_at
CREATE OR REPLACE FUNCTION prevent_created_at_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.created_at <> OLD.created_at THEN
        RAISE EXCEPTION 'created_at cannot be modified';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_players_created_at_update ON players;
CREATE TRIGGER prevent_players_created_at_update
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION prevent_created_at_update();

DROP TRIGGER IF EXISTS prevent_game_history_created_at_update ON game_history;
CREATE TRIGGER prevent_game_history_created_at_update
    BEFORE UPDATE ON game_history
    FOR EACH ROW
    EXECUTE FUNCTION prevent_created_at_update();
