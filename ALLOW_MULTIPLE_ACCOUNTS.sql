-- ============================================
-- ALLOW MULTIPLE ACCOUNTS PER EMAIL/PHONE
-- ============================================
-- This migration allows users to create up to 3 accounts
-- with the same email or phone number (for personal + organizations)

-- Remove UNIQUE constraint on email field
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Remove UNIQUE constraint on phone field if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key;

-- Add a compound index for better query performance
-- This allows duplicate emails but keeps good query performance
CREATE INDEX IF NOT EXISTS idx_users_email_id ON users(email, id);

-- Note: The application logic limits users to 3 accounts per email
-- This is enforced in the signup flow at /src/lib/supabaseAuth.ts
