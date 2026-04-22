-- Add address_visibility field to events table for organization public events
-- This allows organizations to create events where the location is visible to everyone

-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire SQL script
-- 4. Click "Run" to execute
-- 5. Refresh your app to see the changes

-- Add the new column
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS address_visibility TEXT DEFAULT 'rsvp_required' 
CHECK (address_visibility IN ('public', 'rsvp_required'));

-- Add a comment explaining the field
COMMENT ON COLUMN events.address_visibility IS 
'Controls address visibility: "public" = visible to everyone of that ethnicity, "rsvp_required" = only visible to approved RSVPs. Only organizations can set to "public".';

-- Update existing events to use the new field
-- If showAddress was true, keep it as rsvp_required (approved RSVPs only)
-- If showAddress was false, also keep as rsvp_required
UPDATE events 
SET address_visibility = 'rsvp_required' 
WHERE address_visibility IS NULL;