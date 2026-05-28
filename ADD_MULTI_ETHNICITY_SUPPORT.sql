-- ============================================
-- ADD MULTI-ETHNICITY SUPPORT
-- ============================================
-- This migration adds support for users to belong to multiple ethnicities

-- Add available_ethnicities column to store array of ethnicity IDs
ALTER TABLE users
ADD COLUMN IF NOT EXISTS available_ethnicities JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN users.available_ethnicities IS 'Array of ethnicity IDs the user has selected during onboarding. Allows users to participate in multiple ethnic communities.';

-- Update existing users to have at least the armenian ethnicity (default)
-- This ensures existing users can still access the app
UPDATE users
SET available_ethnicities = '["armenian"]'::jsonb
WHERE available_ethnicities = '[]'::jsonb OR available_ethnicities IS NULL;

-- Create an index for faster queries on available_ethnicities
CREATE INDEX IF NOT EXISTS idx_users_available_ethnicities ON users USING GIN (available_ethnicities);
