-- Add twitter_username column to users table
-- Stores user's X (Twitter) username without the @ symbol

ALTER TABLE users
ADD COLUMN IF NOT EXISTS twitter_username VARCHAR(15);

-- Create index for efficient username lookups
CREATE INDEX IF NOT EXISTS idx_users_twitter_username ON users (twitter_username);

-- Add comment explaining the column
COMMENT ON COLUMN users.twitter_username IS 'User X (Twitter) username without @ symbol (max 15 characters)';
