-- ============================================
-- ADD ORGANIZATION LOCATION FIELD
-- ============================================
-- This migration adds an organization_location field
-- to store headquarters/location for organization accounts

-- Add organization_location column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS organization_location TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.organization_location IS 'Location/headquarters of the organization (e.g. New York, London)';
