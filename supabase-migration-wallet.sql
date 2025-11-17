-- Migration: Add wallet_address support to existing players table

-- Add wallet_address column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'wallet_address'
    ) THEN
        ALTER TABLE players ADD COLUMN wallet_address TEXT;
    END IF;
END $$;

-- Create unique index on wallet_address
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_wallet_address_unique ON players(wallet_address) WHERE wallet_address IS NOT NULL;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_players_wallet_address ON players(wallet_address);

-- Make wallet_address NOT NULL after adding (optional, comment out if you want to keep existing records)
-- ALTER TABLE players ALTER COLUMN wallet_address SET NOT NULL;
