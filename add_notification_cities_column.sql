-- Add notification_cities column to users table
-- Run this SQL in your Supabase Dashboard → SQL Editor → New Query

ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_cities JSONB;

-- Optional: Create an index for better performance when querying by city
CREATE INDEX IF NOT EXISTS idx_users_notification_cities ON users USING GIN (notification_cities);
