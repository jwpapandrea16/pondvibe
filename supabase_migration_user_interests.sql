-- Add interests column to users table
-- Stores user's selected subcategories across all categories
-- Structure: {"tv_show": ["Drama", "Sci-Fi"], "movie": ["Action"], "book": ["Fiction"], "travel_destination": ["Beach"]}

ALTER TABLE users
ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '{}'::jsonb;

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN (interests);

-- Add comment explaining the structure
COMMENT ON COLUMN users.interests IS 'User selected interests in format: {"tv_show": ["Drama", "Sci-Fi"], "movie": ["Action"], ...}';
