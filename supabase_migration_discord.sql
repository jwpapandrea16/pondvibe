-- Add Discord authentication fields to users table
-- Run this in your Supabase SQL Editor

-- Add discord_id column (unique identifier)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS discord_id TEXT UNIQUE;

-- Add discord_username column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS discord_username TEXT;

-- Create index on discord_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);

-- Add comment to columns
COMMENT ON COLUMN users.discord_id IS 'Discord user ID for OAuth authentication';
COMMENT ON COLUMN users.discord_username IS 'Discord username in format username#discriminator';
