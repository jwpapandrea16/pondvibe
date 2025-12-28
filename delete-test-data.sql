-- SQL Script to delete test user PandaMonium and The Slight Edge review
-- Run this in the Supabase SQL Editor

-- First, let's find the user ID for PandaMonium
-- (This is a query to verify the user exists before deletion)
SELECT id, username, discord_username, wallet_address
FROM users
WHERE username = 'PandaMonium' OR discord_username = 'PandaMonium';

-- Find the review for "The Slight Edge"
-- (This is a query to verify the review exists before deletion)
SELECT r.id, r.title, r.subject_name, r.user_id, u.username, u.discord_username
FROM reviews r
LEFT JOIN users u ON r.user_id = u.id
WHERE r.subject_name ILIKE '%Slight Edge%';

-- Delete the review for "The Slight Edge"
-- Note: This will delete ALL reviews with "Slight Edge" in the subject_name
DELETE FROM reviews
WHERE subject_name ILIKE '%Slight Edge%';

-- Delete the PandaMonium user
-- Note: This will cascade delete all associated data (reviews, follows, likes, etc.)
-- if foreign keys are set up with CASCADE
DELETE FROM users
WHERE username = 'PandaMonium' OR discord_username = 'PandaMonium';

-- Verify deletion
SELECT COUNT(*) as remaining_pandamonium_users
FROM users
WHERE username = 'PandaMonium' OR discord_username = 'PandaMonium';

SELECT COUNT(*) as remaining_slight_edge_reviews
FROM reviews
WHERE subject_name ILIKE '%Slight Edge%';
