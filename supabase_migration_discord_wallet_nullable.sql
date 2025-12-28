-- Make wallet_address nullable for Discord-only users
-- Run this in Supabase SQL Editor

ALTER TABLE users
ALTER COLUMN wallet_address DROP NOT NULL;

-- Add a check constraint to ensure either wallet_address OR discord_id exists
ALTER TABLE users
ADD CONSTRAINT users_identity_check
CHECK (
  wallet_address IS NOT NULL OR discord_id IS NOT NULL
);
