# Supabase Database Setup Guide

## Step 1: Run This SQL in Supabase Dashboard

Go to your Supabase project → SQL Editor → New Query, paste the following SQL, and click "Run":

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age TEXT NOT NULL,
  ethnicity_id TEXT NOT NULL,
  notification_city TEXT,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  is_organization BOOLEAN DEFAULT false,
  organization_name TEXT,
  organization_type TEXT,
  organization_website TEXT,
  organization_description TEXT,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('curated', 'spontaneous')),
  city TEXT,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  address TEXT,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_attendees INTEGER,
  image_url TEXT NOT NULL,
  tags TEXT[],
  coordinates_lat DOUBLE PRECISION,
  coordinates_lng DOUBLE PRECISION,
  show_address BOOLEAN DEFAULT false,
  ethnicity_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event RSVPs table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Places table
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('restaurant', 'cafe', 'church', 'bakery', 'shop', 'other')),
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  coordinates_lat DOUBLE PRECISION,
  coordinates_lng DOUBLE PRECISION,
  phone TEXT,
  website TEXT,
  cuisine TEXT,
  ethnicity_id TEXT NOT NULL,
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_event', 'follow')),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ethnicity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  button_text TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('main', 'local')),
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsored Event Ads table
CREATE TABLE IF NOT EXISTS sponsored_event_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ethnicity_id TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT NOT NULL,
  event_location TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_time TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_contact TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Promotions table
CREATE TABLE IF NOT EXISTS event_promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ethnicity_id TEXT NOT NULL,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_ethnicity ON events(ethnicity_id);
CREATE INDEX IF NOT EXISTS idx_events_host ON events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_event ON comments(event_id);
CREATE INDEX IF NOT EXISTS idx_places_ethnicity ON places(ethnicity_id);
CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_ethnicity ON ads(ethnicity_id);
CREATE INDEX IF NOT EXISTS idx_ads_city ON ads(city);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsored_event_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users (everyone can read, users can update themselves)
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can delete own profile" ON users FOR DELETE USING (auth.uid()::text = id::text);

-- RLS Policies for Events (everyone can read, creators can update/delete)
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Event hosts can update their events" ON events FOR UPDATE USING (host_id::text = auth.uid()::text);
CREATE POLICY "Event hosts can delete their events" ON events FOR DELETE USING (host_id::text = auth.uid()::text);

-- RLS Policies for RSVPs
CREATE POLICY "RSVPs are viewable by everyone" ON event_rsvps FOR SELECT USING (true);
CREATE POLICY "Users can create RSVPs" ON event_rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their RSVPs" ON event_rsvps FOR UPDATE USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can delete their RSVPs" ON event_rsvps FOR DELETE USING (user_id::text = auth.uid()::text);

-- RLS Policies for Comments
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete their comments" ON comments FOR DELETE USING (user_id::text = auth.uid()::text);

-- RLS Policies for Places
CREATE POLICY "Places are viewable by everyone" ON places FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create places" ON places FOR INSERT WITH CHECK (true);

-- RLS Policies for Conversations & Messages
CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT USING (user1_id::text = auth.uid()::text OR user2_id::text = auth.uid()::text);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id 
    AND (user1_id::text = auth.uid()::text OR user2_id::text = auth.uid()::text)
  )
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update message read status" ON messages FOR UPDATE USING (true);

-- RLS Policies for Follows
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (follower_id::text = auth.uid()::text);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (follower_id::text = auth.uid()::text);

-- RLS Policies for Notifications
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can delete their notifications" ON notifications FOR DELETE USING (user_id::text = auth.uid()::text);

-- RLS Policies for Ads
CREATE POLICY "Ads are viewable by everyone" ON ads FOR SELECT USING (true);
CREATE POLICY "Only admins can manage ads" ON ads FOR ALL USING (false); -- Will need admin role later

-- RLS Policies for Sponsored Event Ads
CREATE POLICY "Sponsored ads are viewable by everyone" ON sponsored_event_ads FOR SELECT USING (true);

-- RLS Policies for Event Promotions
CREATE POLICY "Users can view their promotions" ON event_promotions FOR SELECT USING (requested_by::text = auth.uid()::text);
CREATE POLICY "Users can create promotions" ON event_promotions FOR INSERT WITH CHECK (requested_by::text = auth.uid()::text);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_rsvps_updated_at BEFORE UPDATE ON event_rsvps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsored_event_ads_updated_at BEFORE UPDATE ON sponsored_event_ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 2: Set Up Storage Buckets

Go to Storage in your Supabase dashboard and create these buckets:

1. **avatars** (Public bucket)
   - For user profile pictures
   - Max file size: 2MB

2. **event-images** (Public bucket)
   - For event photos
   - Max file size: 5MB

3. **place-images** (Public bucket)
   - For place photos
   - Max file size: 5MB

4. **ad-images** (Public bucket)
   - For advertisement images
   - Max file size: 5MB

## Step 3: Configure Authentication

1. Go to Authentication → Providers
2. Enable **Email** provider (already enabled by default)
3. Optional: Enable social providers (Google, Facebook, etc.) for faster signups

## Step 4: Set Up Realtime (for notifications)

1. Go to Database → Replication
2. Enable replication for these tables:
   - `notifications`
   - `messages`
   - `event_rsvps`

## Step 5: Done!

Your database is now ready. The app will automatically connect using the credentials in `/utils/supabase/info.tsx`.

## Next Steps

The following files have been created to integrate Supabase:
- `/src/lib/supabase.ts` - Supabase client & types
- `/src/lib/supabaseAuth.ts` - Authentication helpers
- Updated context files to use Supabase instead of localStorage

## Important Notes

⚠️ **Security**: The RLS policies are basic. For production, you'll want to:
- Add proper admin role checks for ads management
- Add more granular permissions
- Set up proper auth.uid() checks

⚠️ **Performance**: Indexes are created for common queries. Monitor slow queries in production.

⚠️ **Cost**: Free tier includes:
- 500MB database space
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth

You'll need to upgrade when you exceed these limits.
