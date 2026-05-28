-- ============================================
-- UPDATE COMMENT RLS POLICY
-- ============================================
-- This script updates the comment insertion policy to only allow
-- users with approved RSVPs or event hosts to comment.
--
-- HOW TO USE:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this entire script
-- 4. Click "Run"

-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;

-- Create new policy that checks for approved RSVP or host status
CREATE POLICY "Users with approved RSVP or hosts can create comments" 
ON comments 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    -- User is the event host
    auth.uid() IN (
      SELECT host_id FROM events WHERE id = event_id
    )
    OR
    -- User has an accepted RSVP
    auth.uid() IN (
      SELECT user_id FROM event_rsvps 
      WHERE event_id = comments.event_id 
      AND status = 'accepted'
    )
  )
);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'comments';
