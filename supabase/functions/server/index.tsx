import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { WORLDWIDE_PLACES } from "./placesData.tsx";
import { initializeStripe } from "./stripe.tsx";

const app = new Hono();

// Retry helper for KV operations with exponential backoff
async function retryKvOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
      
      console.warn(`⚠️ ${operationName} failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (isLastAttempt) {
        console.error(`❌ ${operationName} failed after ${maxRetries} attempts`);
        throw error;
      }
      
      console.log(`🔄 Retrying ${operationName} in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error(`${operationName} failed after ${maxRetries} retries`);
}

// Initialize Supabase client for server operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize storage bucket on startup
async function initializeStorageBuckets() {
  try {
    const buckets = ['make-026f502c-event-images', 'make-026f502c-avatars'];
    
    // Check existing buckets
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    
    for (const bucketName of buckets) {
      const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`📦 Creating storage bucket: ${bucketName}`);
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
        
        if (error) {
          // Ignore 409 conflict errors (bucket already exists)
          if (error.statusCode === '409' || error.message?.includes('already exists')) {
            console.log(`✅ Storage bucket ${bucketName} already exists`);
          } else {
            console.error(`❌ Failed to create storage bucket ${bucketName}:`, error);
          }
        } else {
          console.log(`✅ Storage bucket ${bucketName} created successfully`);
        }
      } else {
        console.log(`✅ Storage bucket ${bucketName} already exists`);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing storage buckets:', error);
  }
}

// Add status column to follows table (migration)
async function migrateFollowsTable() {
  try {
    console.log('🔄 Checking follows table schema...');
    
    // Skip migration - not needed since it can cause resource issues on startup
    console.log('⏭️ Skipping follows migration (run SQL migration in Supabase SQL Editor instead)');
    
  } catch (error) {
    console.error('❌ Error migrating follows table:', error);
  }
}

// Initialize on startup (but don't run heavy migrations)
initializeStorageBuckets();
// migrateFollowsTable(); // Disabled to prevent startup resource exhaustion

// Initialize Stripe on startup
initializeStripe();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-026f502c/health", (c) => {
  return c.json({ status: "ok" });
});

// Schema check endpoint - helps diagnose missing columns
app.get("/make-server-026f502c/debug/schema-check", async (c) => {
  try {
    // Try to query with the address_visibility column
    const { data, error } = await supabase
      .from('events')
      .select('id, address_visibility')
      .limit(1);

    if (error) {
      return c.json({
        status: 'column_missing',
        error: error.message,
        message: 'The address_visibility column does not exist yet. Please run the migration SQL.',
      });
    }

    return c.json({
      status: 'column_exists',
      message: 'Schema is up to date!',
    });
  } catch (error) {
    return c.json({
      status: 'error',
      error: String(error),
    });
  }
});

// DEBUG: List all events in database
app.get("/make-server-026f502c/debug/events", async (c) => {
  try {
    const { data: allEvents, error } = await supabase
      .from('events')
      .select('id, title, ethnicity_id')
      .limit(20);
    
    if (error) {
      return c.json({ error: error.message, details: error }, 500);
    }
    
    return c.json({ 
      count: allEvents?.length || 0,
      events: allEvents || [],
      message: 'All events in database (limit 20)'
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Server-side session token storage for Figma Make sandbox
// Store session tokens on server and retrieve them via URL parameter
app.post("/make-server-026f502c/auth/store-session", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, session } = body;
    
    if (!userId || !session) {
      return c.json({ error: "Missing userId or session" }, 400);
    }
    
    // Generate a random session token
    const sessionToken = crypto.randomUUID();
    
    // Store the session in KV store with retry logic
    await retryKvOperation(
      () => kv.set(`session:${sessionToken}`, {
        userId,
        session,
        createdAt: new Date().toISOString(),
      }),
      'Session storage'
    );
    
    console.log('✅ Session stored on server with token:', sessionToken);
    
    return c.json({ sessionToken });
  } catch (error) {
    console.error('❌ Error storing session after retries:', error);
    return c.json({ error: 'Failed to store session' }, 500);
  }
});

// Retrieve session from server using session token
app.get("/make-server-026f502c/auth/get-session/:token", async (c) => {
  try {
    const token = c.req.param('token');
    
    if (!token) {
      return c.json({ error: "Missing session token" }, 400);
    }
    
    // Retrieve session from KV store
    const sessionData = await kv.get(`session:${token}`);
    
    if (!sessionData) {
      return c.json({ error: "Session not found or expired" }, 404);
    }
    
    console.log('✅ Session retrieved from server for token:', token);
    
    return c.json({ session: sessionData.session, userId: sessionData.userId });
  } catch (error) {
    console.error('Error retrieving session:', error);
    return c.json({ error: 'Failed to retrieve session' }, 500);
  }
});

// Quick Resume - Save user credentials for instant re-login
app.post("/make-server-026f502c/auth/quick-resume/save", async (c) => {
  try {
    const body = await c.req.json();
    const { deviceId, email, userId } = body;
    
    if (!deviceId || !email || !userId) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Generate a resume token
    const resumeToken = crypto.randomUUID();
    
    // Store resume data in KV (expires after 7 days)
    await kv.set(`resume:${resumeToken}`, {
      deviceId,
      email,
      userId,
      createdAt: new Date().toISOString(),
    });
    
    console.log('✅ Quick resume saved for email:', email);
    
    return c.json({ resumeToken });
  } catch (error) {
    console.error('Error saving quick resume:', error);
    return c.json({ error: 'Failed to save quick resume' }, 500);
  }
});

// Quick Resume - Load user credentials for instant re-login
app.get("/make-server-026f502c/auth/quick-resume/load/:token", async (c) => {
  try {
    const token = c.req.param('token');

    if (!token) {
      return c.json({ error: "Missing resume token" }, 400);
    }

    // Retrieve resume data from KV
    const resumeData = await kv.get(`resume:${token}`);

    if (!resumeData) {
      return c.json({ error: "Resume token not found or expired" }, 404);
    }

    console.log('✅ Quick resume loaded for email:', resumeData.email);

    return c.json({
      email: resumeData.email,
      userId: resumeData.userId,
    });
  } catch (error) {
    console.error('Error loading quick resume:', error);
    return c.json({ error: 'Failed to load quick resume' }, 500);
  }
});

// Direct password reset (bypasses email delivery requirement)
app.post("/make-server-026f502c/reset-password-direct", async (c) => {
  try {
    const body = await c.req.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return c.json({ error: "Missing email or newPassword" }, 400);
    }

    const baseEmail = email.toLowerCase().trim();

    console.log('🔐 Direct password reset request for:', baseEmail);

    // First, verify the user exists in the users table
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', baseEmail);

    if (findError) {
      console.error('❌ Error finding user:', findError);
      return c.json({ error: 'Database error occurred' }, 500);
    }

    if (!users || users.length === 0) {
      console.error('❌ No user found with email:', baseEmail);
      return c.json({ error: 'No account found with this email address' }, 404);
    }

    const userId = users[0].id;
    console.log('✅ User found:', userId);

    // Use Supabase Admin API to update the user's password
    // This bypasses email verification and directly updates the password
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Failed to update password:', updateError);
      return c.json({
        error: 'Failed to reset password. Please try again or contact support.',
        details: updateError.message
      }, 500);
    }

    console.log('✅ Password reset successfully for user:', userId);

    return c.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('❌ Unexpected error in direct password reset:', error);
    return c.json({
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Create or get user profile
app.post("/make-server-026f502c/users/profile", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, email, name, ethnicityId } = body;
    
    if (!userId || !email) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Use UPSERT to either create new profile or return existing one
    // This prevents duplicate key errors and handles race conditions
    const { data: profile, error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: email,
        name: name || email.split('@')[0],
        ethnicity_id: ethnicityId || 'armenian',
        email_notifications: true,
        sms_notifications: true,
        is_organization: false,
      }, {
        onConflict: 'id',
        ignoreDuplicates: false, // Update if exists
      })
      .select()
      .single();
    
    if (upsertError) {
      console.error('Error creating/updating user profile:', upsertError);
      return c.json({ error: upsertError.message }, 500);
    }
    
    return c.json({ profile });
  } catch (error) {
    console.error('Unexpected error in /users/profile:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get notifications with user data (no event join since FK doesn't exist)
app.get("/make-server-026f502c/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }
    
    // Fetch notifications
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get notifications error:', error);
      return c.json({ error: 'Failed to load notifications' }, 500);
    }
    
    // Fetch user data separately for all from_user_ids
    const fromUserIds = [...new Set((data || []).map((n: any) => n.from_user_id))];
    const { data: usersData } = fromUserIds.length > 0
      ? await supabase
          .from('users')
          .select('id, name, avatar_url, is_organization')
          .in('id', fromUserIds)
      : { data: [] };
    
    // Fetch event titles separately for notifications that have event_id
    const notificationsWithEvents = await Promise.all(
      (data || []).map(async (notif: any) => {
        const userInfo = usersData?.find((u: any) => u.id === notif.from_user_id);
        const fromUser = userInfo ? {
          ...userInfo,
          avatar: userInfo.avatar_url // Map avatar_url to avatar for frontend
        } : null;
        
        if (notif.event_id) {
          const { data: eventData } = await supabase
            .from('events')
            .select('title')
            .eq('id', notif.event_id)
            .single();
          
          return { ...notif, from_user: fromUser, event: eventData };
        }
        return { ...notif, from_user: fromUser };
      })
    );
    
    return c.json({ notifications: notificationsWithEvents });
  } catch (error) {
    console.error('Unexpected error in /notifications:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get events with host and RSVP data (bypasses RLS)
app.get("/make-server-026f502c/events", async (c) => {
  try {
    const ethnicityId = c.req.query('ethnicityId');
    
    console.log('🔍 Fetching events for ethnicity:', ethnicityId);
    
    // Fetch events, optionally filtered by ethnicity
    let query = supabase
      .from('events')
      .select('*');
    
    if (ethnicityId) {
      query = query.eq('ethnicity_id', ethnicityId);
    }
    
    const { data: eventsData, error: eventsError } = await query
      .order('date', { ascending: true })
      .limit(200); // Reasonable limit to prevent resource exhaustion
    
    if (eventsError) {
      console.error('Get events error:', eventsError);
      return c.json({ error: 'Failed to load events', details: eventsError.message }, 500);
    }
    
    if (!eventsData || eventsData.length === 0) {
      console.log('✅ No events found, returning empty array');
      return c.json({ events: [], rsvps: [] });
    }
    
    console.log(`✅ Found ${eventsData.length} events`);
    
    // Fetch host data separately for all events
    const hostIds = [...new Set(eventsData.map((e: any) => e.host_id).filter(Boolean))];
    const { data: hostsData } = hostIds.length > 0
      ? await supabase
          .from('users')
          .select('id, name, avatar_url, is_organization, organization_name, organization_type')
          .in('id', hostIds)
      : { data: [] };
    
    console.log(`✅ Found ${hostsData?.length || 0} hosts`);
    
    // Attach host data to events
    const eventsWithHosts = eventsData.map((event: any) => {
      const hostInfo = hostsData?.find((h: any) => h.id === event.host_id);
      return {
        ...event,
        host: hostInfo ? {
          ...hostInfo,
          avatar: hostInfo.avatar_url // Map avatar_url to avatar for frontend
        } : null,
      };
    });
    
    // Fetch RSVPs for all events (with limit to prevent resource issues)
    const eventIds = eventsData.map((e: any) => e.id).filter(Boolean);
    const { data: rsvpsDataRaw } = eventIds.length > 0 
      ? await supabase
          .from('event_rsvps')
          .select('*')
          .in('event_id', eventIds)
          .limit(1000) // Increased limit but still safe
      : { data: [] };
    
    console.log(`✅ Found ${rsvpsDataRaw?.length || 0} RSVPs`);
    
    // Fetch user data for RSVPs
    const rsvpUserIds = [...new Set((rsvpsDataRaw || []).map((r: any) => r.user_id))];
    console.log('👥 [SERVER] RSVP user IDs to fetch:', rsvpUserIds);
    
    const { data: rsvpUsersData, error: rsvpUsersError } = rsvpUserIds.length > 0
      ? await supabase
          .from('users')
          .select('id, name, avatar_url, is_organization')
          .in('id', rsvpUserIds)
      : { data: [], error: null };
    
    if (rsvpUsersError) {
      console.error('❌ [SERVER] Error fetching RSVP user data:', rsvpUsersError);
    }
    
    console.log('👥 [SERVER] Fetched user data for RSVPs:', rsvpUsersData);
    console.log('👥 [SERVER] Expected', rsvpUserIds.length, 'users, found', rsvpUsersData?.length || 0, 'users');
    
    // Log which user IDs are missing
    const foundUserIds = rsvpUsersData?.map((u: any) => u.id) || [];
    const missingUserIds = rsvpUserIds.filter(id => !foundUserIds.includes(id));
    if (missingUserIds.length > 0) {
      console.error('❌ [SERVER] Missing user records for IDs:', missingUserIds);
    }
    
    // Attach user data to RSVPs
    const rsvpsData = (rsvpsDataRaw || []).map((rsvp: any) => {
      const userInfo = rsvpUsersData?.find((u: any) => u.id === rsvp.user_id);
      if (!userInfo) {
        console.warn(`⚠️ [SERVER] User not found for RSVP user_id:`, rsvp.user_id);
      }
      return {
        ...rsvp,
        user: userInfo ? {
          ...userInfo,
          avatar: userInfo.avatar_url // Map avatar_url to avatar for frontend
        } : null,
      };
    });
    
    console.log('📋 [SERVER] RSVPs with attached user data:', rsvpsData.map((r: any) => ({
      userId: r.user_id,
      userName: r.user?.name || 'NO NAME FOUND',
      userExists: !!r.user,
      status: r.status,
    })));
    
    console.log('✅ Returning events with hosts and RSVPs');
    return c.json({ events: eventsWithHosts || [], rsvps: rsvpsData || [] });
  } catch (error) {
    console.error('❌ Unexpected error in /events:', error);
    // Return a more detailed error
    return c.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});

// Get single event with details (bypasses RLS)
app.get("/make-server-026f502c/events/:eventId", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    
    console.log('🔍 [SERVER] ========================================');
    console.log('🔍 [SERVER] Fetching event by ID:', eventId);
    console.log('🔍 [SERVER] ID type:', typeof eventId);
    console.log('🔍 [SERVER] ID length:', eventId?.length);
    console.log('🔍 [SERVER] ========================================');
    
    if (!eventId) {
      console.error('❌ [SERVER] Missing eventId');
      return c.json({ error: "Missing eventId" }, 400);
    }
    
    // First, let's check if ANY events exist
    const { data: allEvents, error: allError } = await supabase
      .from('events')
      .select('id, title')
      .limit(5);
    
    console.log('🔍 [SERVER] Sample events in database:', allEvents);
    console.log('🔍 [SERVER] Sample event IDs:', allEvents?.map(e => e.id));
    
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    
    console.log('🔍 [SERVER] Query result - data:', eventData);
    console.log('🔍 [SERVER] Query result - error:', eventError);
    
    if (eventError) {
      console.error('❌ [SERVER] Get event error:', eventError);
      return c.json({ error: 'Event not found', details: eventError }, 404);
    }
    
    if (!eventData) {
      console.error('❌ [SERVER] No event data returned for ID:', eventId);
      return c.json({ error: 'Event not found' }, 404);
    }
    
    console.log('✅ [SERVER] Found event:', eventData.id, eventData.title);
    
    // Fetch host data separately
    const { data: hostData, error: hostError } = await supabase
      .from('users')
      .select('id, name, avatar_url, is_organization, organization_name, organization_type')
      .eq('id', eventData.host_id)
      .single();
    
    if (hostError) {
      console.warn('⚠️ [SERVER] Host fetch error:', hostError);
    }
    
    console.log('✅ [SERVER] Found host:', hostData?.name);
    
    // Attach host to event
    const eventWithHost = {
      ...eventData,
      host: hostData ? {
        ...hostData,
        avatar: hostData.avatar_url // Map avatar_url to avatar for frontend
      } : null,
    };
    
    // Get RSVPs
    const { data: rsvpsDataRaw } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId);
    
    console.log('📊 [SERVER] Found RSVPs:', rsvpsDataRaw?.length || 0);
    
    // Fetch user data for RSVPs
    const rsvpUserIds = [...new Set((rsvpsDataRaw || []).map((r: any) => r.user_id))];
    const { data: rsvpUsersData } = rsvpUserIds.length > 0
      ? await supabase
          .from('users')
          .select('id, name, avatar_url, is_organization')
          .in('id', rsvpUserIds)
      : { data: [] };
    
    // Attach user data to RSVPs
    const rsvpsData = (rsvpsDataRaw || []).map((rsvp: any) => {
      const userInfo = rsvpUsersData?.find((u: any) => u.id === rsvp.user_id);
      if (!userInfo) {
        console.warn(`⚠️ [SERVER] User not found for RSVP user_id:`, rsvp.user_id);
      }
      return {
        ...rsvp,
        user: userInfo ? {
          ...userInfo,
          avatar: userInfo.avatar_url // Map avatar_url to avatar for frontend
        } : null,
      };
    });
    
    // Get comments
    const { data: commentsDataRaw } = await supabase
      .from('comments')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });
    
    console.log('💬 [SERVER] Found comments:', commentsDataRaw?.length || 0);
    
    // Fetch user data for comments
    const commentUserIds = [...new Set((commentsDataRaw || []).map((c: any) => c.user_id))];
    const { data: commentUsersData } = commentUserIds.length > 0
      ? await supabase
          .from('users')
          .select('id, name, avatar_url')
          .in('id', commentUserIds)
      : { data: [] };
    
    // Attach user data to comments
    const commentsData = (commentsDataRaw || []).map((comment: any) => {
      const userInfo = commentUsersData?.find((u: any) => u.id === comment.user_id);
      return {
        id: comment.id,
        userId: comment.user_id,
        userName: userInfo?.name || 'Unknown',
        userAvatar: userInfo?.avatar_url || null,
        text: comment.text,
        createdAt: comment.created_at,
        isHost: comment.user_id === eventData.host_id,
      };
    });
    
    // Transform event data to match frontend format (camelCase)
    const transformedEvent = {
      id: eventWithHost.id,
      title: eventWithHost.title,
      description: eventWithHost.description,
      type: eventWithHost.type,
      city: eventWithHost.city,
      location: eventWithHost.location,
      date: eventWithHost.date,
      time: eventWithHost.time,
      address: eventWithHost.address,
      host: {
        id: eventWithHost.host?.id || eventWithHost.host_id,
        name: eventWithHost.host?.name || 'Unknown',
        avatar: eventWithHost.host?.avatar || null,
        isOrganization: eventWithHost.host?.is_organization || false,
        organizationName: eventWithHost.host?.organization_name || null,
        organizationType: eventWithHost.host?.organization_type || null,
      },
      attendees: eventWithHost.attendees || 1,
      maxAttendees: eventWithHost.max_attendees || null,
      imageUrl: eventWithHost.image_url,
      tags: eventWithHost.tags || [],
      coordinates: eventWithHost.coordinates_lat && eventWithHost.coordinates_lng ? {
        lat: eventWithHost.coordinates_lat,
        lng: eventWithHost.coordinates_lng,
      } : undefined,
      showAddress: eventWithHost.show_address || false,
      createdAt: eventWithHost.created_at,
      rsvps: rsvpsData.map((rsvp: any) => ({
        userId: rsvp.user_id,
        userName: rsvp.user?.name || 'Unknown',
        status: rsvp.status,
        requestedAt: rsvp.requested_at,
      })),
      comments: commentsData,
    };
    
    console.log('✅ [SERVER] Returning event with host and RSVPs');
    return c.json({ event: transformedEvent, rsvps: rsvpsData });
  } catch (error) {
    console.error('❌ [SERVER] Unexpected error in /events/:eventId:', error);
    return c.json({ error: 'Internal server error', details: String(error) }, 500);
  }
});

// Get user data (bypasses RLS)
app.get("/make-server-026f502c/users/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Get user error:', userError);
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ user: userData });
  } catch (error) {
    console.error('Unexpected error in /users/:userId:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create event (bypasses RLS)
app.post("/make-server-026f502c/events", async (c) => {
  try {
    const body = await c.req.json();
    const {
      title,
      description,
      type,
      city,
      location,
      date,
      time,
      address,
      hostId,
      maxAttendees,
      imageUrl,
      tags,
      coordinatesLat,
      coordinatesLng,
      showAddress,
      ethnicityId,
      addressVisibility,
    } = body;
    
    if (!title || !description || !type || !city || !location || !date || !hostId || !ethnicityId) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Insert event - use location for address if address is not provided
    // Build the event data object
    const eventDataToInsert: any = {
      title,
      description,
      type,
      city,
      location,
      date,
      time,
      address: address || location, // Use location as fallback if address not provided
      host_id: hostId,
      max_attendees: maxAttendees,
      image_url: imageUrl,
      tags,
      coordinates_lat: coordinatesLat,
      coordinates_lng: coordinatesLng,
      show_address: showAddress ?? false,
      ethnicity_id: ethnicityId,
    };

    // Only add address_visibility if it's provided (column might not exist yet)
    if (addressVisibility !== undefined) {
      eventDataToInsert.address_visibility = addressVisibility || 'rsvp_required';
    }

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert(eventDataToInsert)
      .select()
      .single();
    
    if (eventError) {
      console.error('Create event error:', eventError);
      return c.json({ error: 'Failed to create event', details: eventError }, 500);
    }
    
    return c.json({ event: eventData });
  } catch (error) {
    console.error('Unexpected error in /events POST:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update event (bypasses RLS)
app.put("/make-server-026f502c/events/:eventId", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const body = await c.req.json();
    const {
      userId,
      title,
      description,
      location,
      city,
      date,
      time,
    } = body;
    
    if (!eventId || !userId) {
      return c.json({ error: "Missing eventId or userId" }, 400);
    }
    
    // Verify that the user is the host of the event
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('host_id')
      .eq('id', eventId)
      .single();
    
    if (eventError || !eventData) {
      console.error('Event not found:', eventError);
      return c.json({ error: 'Event not found' }, 404);
    }
    
    if (eventData.host_id !== userId) {
      return c.json({ error: 'Unauthorized: Only the host can edit this event' }, 403);
    }
    
    // Update the event
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (city) updateData.city = city;
    if (date) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Update event error:', updateError);
      return c.json({ error: 'Failed to update event', details: updateError }, 500);
    }
    
    console.log('✅ Event updated successfully:', eventId);
    return c.json({ event: updatedEvent });
  } catch (error) {
    console.error('Unexpected error in /events PUT:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete event (bypasses RLS)
app.delete("/make-server-026f502c/events/:eventId", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const body = await c.req.json();
    const { userId } = body;
    
    if (!eventId || !userId) {
      return c.json({ error: "Missing eventId or userId" }, 400);
    }
    
    // Verify that the user is the host of the event
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('host_id')
      .eq('id', eventId)
      .single();
    
    if (eventError || !eventData) {
      console.error('Event not found:', eventError);
      return c.json({ error: 'Event not found' }, 404);
    }
    
    if (eventData.host_id !== userId) {
      return c.json({ error: 'Unauthorized: Only the host can delete this event' }, 403);
    }
    
    // Delete associated RSVPs first (cascade might not be set up)
    await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId);
    
    // Delete associated comments
    await supabase
      .from('event_comments')
      .delete()
      .eq('event_id', eventId);
    
    // Delete the event
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (deleteError) {
      console.error('Delete event error:', deleteError);
      return c.json({ error: 'Failed to delete event', details: deleteError }, 500);
    }
    
    console.log('✅ Event deleted successfully:', eventId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in /events DELETE:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update RSVP status (approve/decline)
app.put("/make-server-026f502c/events/:eventId/rsvps/:userId", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const userId = c.req.param('userId');
    const body = await c.req.json();
    const { status, hostId } = body;
    
    console.log('🔄 [SERVER] Update RSVP request:', { eventId, userId, status, hostId });
    
    if (!status || !hostId) {
      return c.json({ error: 'Missing status or hostId' }, 400);
    }
    
    if (!['accepted', 'declined'].includes(status)) {
      return c.json({ error: 'Invalid status. Must be accepted or declined' }, 400);
    }
    
    // Verify the requester is the event host
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('host_id')
      .eq('id', eventId)
      .single();
    
    console.log('🔍 [SERVER] Event verification:', { eventData, expectedHostId: hostId });
    
    if (eventError || !eventData) {
      console.error('❌ [SERVER] Event not found:', eventError);
      return c.json({ error: 'Event not found' }, 404);
    }
    
    if (eventData.host_id !== hostId) {
      console.error('❌ [SERVER] Authorization failed:', { 
        eventHostId: eventData.host_id, 
        requesterId: hostId 
      });
      return c.json({ error: 'Only the event host can update RSVPs' }, 403);
    }
    
    console.log('✅ [SERVER] Authorization passed, updating RSVP...');
    
    // Update the RSVP status
    const { error: updateError } = await supabase
      .from('event_rsvps')
      .update({ status })
      .eq('event_id', eventId)
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('❌ [SERVER] RSVP update error:', updateError);
      return c.json({ error: 'Failed to update RSVP', details: updateError }, 500);
    }
    
    console.log('✅ [SERVER] RSVP updated successfully');
    
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ [SERVER] Unexpected error in RSVP update:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Upload avatar image
app.post("/make-server-026f502c/upload-avatar", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, imageData } = body;
    
    if (!userId || !imageData) {
      return c.json({ error: "Missing userId or imageData" }, 400);
    }
    
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Generate unique filename
    const fileExt = imageData.match(/data:image\/(\w+)/)?.[1] || 'png';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('make-026f502c-avatars')
      .upload(fileName, buffer, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload image' }, 500);
    }
    
    // Get public URL and convert to string
    const { data } = supabase.storage
      .from('make-026f502c-avatars')
      .getPublicUrl(fileName);
    
    const avatarUrl = String(data.publicUrl); // Convert URL object to string
    
    // Update avatar URL in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);
    
    if (updateError) {
      console.error('❌ Failed to update avatar_url in users table:', updateError);
      return c.json({ error: 'Failed to save avatar' }, 500);
    }
    
    console.log('✅ Avatar URL saved to users table:', avatarUrl);
    
    // Also store in KV store for backward compatibility
    await kv.set(`user_avatar:${userId}`, avatarUrl);
    
    return c.json({ avatarUrl });
  } catch (error) {
    console.error('Unexpected error in /upload-avatar:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get avatar URL for a user
app.get("/make-server-026f502c/avatar/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }
    
    // Retrieve avatar URL from KV store
    const avatarUrl = await kv.get(`user_avatar:${userId}`);
    
    return c.json({ avatarUrl: avatarUrl || null });
  } catch (error) {
    console.error('Unexpected error in /avatar/:userId:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Seed places data for all ethnicities
app.post("/make-server-026f502c/seed-places", async (c) => {
  try {
    const body = await c.req.json();
    const { userId } = body;
    
    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }
    
    console.log('🌱 Starting to seed places data...');
    
    const placesData = WORLDWIDE_PLACES;
    
    // Helper function to get appropriate image URL for each place type
    const getPlaceImageUrl = (type: string, name: string): string => {
      const imageMap: Record<string, string[]> = {
        restaurant: [
          'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop', // Restaurant dining
          'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop', // Mediterranean food
          'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', // Kebabs
          'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop', // Middle Eastern food
          'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop', // Greek food
          'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', // Grilled meat
          'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop', // Mediterranean spread
          'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop', // Shawarma
        ],
        cafe: [
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop', // Cafe interior
          'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=300&fit=crop', // Coffee and pastries
          'https://images.unsplash.com/photo-1559496417-e7f25cb247f6?w=400&h=300&fit=crop', // Latte art
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop', // Coffee cups
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop', // Cozy cafe
        ],
        church: [
          'https://images.unsplash.com/photo-1548625149-fc4c735b6dd5?w=400&h=300&fit=crop', // Church interior
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop', // Cathedral architecture
          'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400&h=300&fit=crop', // Church exterior
          'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&h=300&fit=crop', // Orthodox church
          'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=400&h=300&fit=crop', // Church altar
        ],
        bakery: [
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', // Assorted bread
          'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=300&fit=crop', // Fresh pastries
          'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop', // Croissants
          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop', // Bakery display
          'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop', // Baklava/pastries
          'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400&h=300&fit=crop', // Artisan bread
        ],
        shop: [
          'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop', // Market stall
          'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400&h=300&fit=crop', // Spices market
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop', // Grocery store
          'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=300&fit=crop', // Mediterranean products
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop', // Retail interior
        ],
        other: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', // Scenic location
          'https://images.unsplash.com/photo-1533094602577-198d3beab8ea?w=400&h=300&fit=crop', // City street
          'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop', // Urban scene
        ],
      };
      
      const images = imageMap[type] || imageMap.other;
      // Use name hash to consistently assign same image to same place
      const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return images[hash % images.length];
    };
    
    let successCount = 0;
    let errorCount = 0;
    
    // Insert places one by one
    for (const place of placesData) {
      try {
        const { error } = await supabase
          .from('places')
          .insert({
            name: place.name,
            type: place.type,
            city: place.city,
            address: place.address,
            description: place.description,
            phone: place.phone || null,
            website: null,
            image_url: getPlaceImageUrl(place.type, place.name),
            ethnicity_id: place.ethnicityId,
            submitted_by_id: userId,
            status: 'approved', // Auto-approve seed data
          });
        
        if (error) {
          console.error(`❌ Failed to insert ${place.name}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Error inserting ${place.name}:`, error);
        errorCount++;
      }
    }
    
    console.log(`✅ Seed complete: ${successCount} places added, ${errorCount} errors`);
    
    return c.json({ 
      success: true, 
      message: `Successfully seeded ${successCount} places`,
      successCount,
      errorCount,
      totalAttempted: placesData.length
    });
  } catch (error) {
    console.error('Unexpected error in /seed-places:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get pending places (bypasses RLS for admin access)
app.get("/make-server-026f502c/places/pending", async (c) => {
  try {
    const ethnicityId = c.req.query('ethnicityId');
    
    let query = supabase
      .from('places')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (ethnicityId) {
      query = query.eq('ethnicity_id', ethnicityId);
    }
    
    const { data: placesData, error: placesError } = await query;
    
    if (placesError) {
      console.error('Get pending places error:', placesError);
      return c.json({ error: 'Failed to load pending places' }, 500);
    }
    
    // Fetch submitter data for all places
    const submitterIds = [...new Set(placesData.map((p: any) => p.submitted_by_id))];
    const { data: submittersData } = submitterIds.length > 0
      ? await supabase
          .from('users')
          .select('id, name')
          .in('id', submitterIds)
      : { data: [] };
    
    // Attach submitter data to places
    const placesWithSubmitters = placesData.map((place: any) => ({
      ...place,
      submittedBy: submittersData?.find((s: any) => s.id === place.submitted_by_id) || null,
    }));
    
    return c.json({ places: placesWithSubmitters });
  } catch (error) {
    console.error('Unexpected error in /places/pending:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Moderate place (approve/reject) - bypasses RLS
app.post("/make-server-026f502c/places/:placeId/moderate", async (c) => {
  try {
    const placeId = c.req.param('placeId');
    const body = await c.req.json();
    const { status } = body;
    
    if (!placeId || !status) {
      return c.json({ error: "Missing placeId or status" }, 400);
    }
    
    if (status !== 'approved' && status !== 'rejected') {
      return c.json({ error: "Invalid status. Must be 'approved' or 'rejected'" }, 400);
    }
    
    const { error } = await supabase
      .from('places')
      .update({ status })
      .eq('id', placeId);
    
    if (error) {
      console.error('Moderate place error:', error);
      return c.json({ error: 'Failed to moderate place' }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in /places/:placeId/moderate:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get single place details
app.get("/make-server-026f502c/places/:placeId", async (c) => {
  try {
    const placeId = c.req.param('placeId');
    
    if (!placeId) {
      console.error('❌ Missing placeId in request');
      return c.json({ error: "Missing placeId" }, 400);
    }
    
    console.log('🔍 Looking for place with ID:', placeId);
    
    // First, try to find the place without status filter to see if it exists
    const { data: anyPlace, error: anyError } = await supabase
      .from('places')
      .select('*')
      .eq('id', placeId)
      .single();
    
    if (anyError) {
      console.error('❌ Place not found in database:', placeId, anyError);
      return c.json({ error: 'Place not found', details: anyError.message }, 404);
    }
    
    console.log('✅ Place found:', anyPlace.name, 'Status:', anyPlace.status);
    
    // Check if approved
    if (anyPlace.status !== 'approved') {
      console.warn('⚠️ Place exists but is not approved:', placeId, 'Status:', anyPlace.status);
      return c.json({ error: 'Place is pending approval', status: anyPlace.status }, 403);
    }
    
    // Transform snake_case to camelCase for frontend
    const place = {
      id: anyPlace.id,
      name: anyPlace.name,
      type: anyPlace.type,
      city: anyPlace.city,
      address: anyPlace.address,
      description: anyPlace.description,
      phone: anyPlace.phone,
      website: anyPlace.website,
      imageUrl: anyPlace.image_url,
      ethnicityId: anyPlace.ethnicity_id,
      submittedById: anyPlace.submitted_by_id,
      status: anyPlace.status,
      createdAt: anyPlace.created_at,
      updatedAt: anyPlace.updated_at,
    };
    
    return c.json({ place });
  } catch (error) {
    console.error('❌ Unexpected error in /places/:placeId:', error);
    return c.json({ error: 'Internal server error', details: String(error) }, 500);
  }
});

// Get comments for a place
app.get("/make-server-026f502c/places/:placeId/comments", async (c) => {
  try {
    const placeId = c.req.param('placeId');
    
    console.log('📝 Loading comments for place:', placeId);
    
    if (!placeId) {
      return c.json({ error: "Missing placeId" }, 400);
    }
    
    // Get comments from KV store (stored as place_comments:{placeId})
    const commentsData = await kv.getByPrefix(`place_comments:${placeId}:`);
    
    console.log('📝 Found comments data:', commentsData?.length || 0, 'items');
    console.log('📝 Raw comments data:', JSON.stringify(commentsData));
    
    // getByPrefix already returns the values, no need to map
    // Sort by created date (newest first)
    const comments = (commentsData || [])
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('📝 Returning', comments.length, 'comments');
    
    return c.json({ comments });
  } catch (error) {
    console.error('❌ Unexpected error in /places/:placeId/comments:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Post a comment on a place
app.post("/make-server-026f502c/places/:placeId/comments", async (c) => {
  try {
    const placeId = c.req.param('placeId');
    const body = await c.req.json();
    const { userId, userName, comment } = body;
    
    console.log('📝 Posting comment to place:', placeId, 'by user:', userName);
    
    if (!placeId || !userId || !userName || !comment) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Create comment object
    const commentId = crypto.randomUUID();
    const commentData = {
      id: commentId,
      placeId,
      userId,
      userName,
      comment,
      createdAt: new Date().toISOString(),
    };
    
    // Store in KV with retry logic
    await retryKvOperation(
      () => kv.set(`place_comments:${placeId}:${commentId}`, commentData),
      'Comment storage'
    );
    
    console.log('✅ Comment saved successfully:', commentId);
    
    return c.json({ comment: commentData });
  } catch (error) {
    console.error('❌ Unexpected error in /places/:placeId/comments POST:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update a comment on a place (Admin only)
app.put("/make-server-026f502c/places/:placeId/comments/:commentId", async (c) => {
  try {
    const placeId = c.req.param('placeId');
    const commentId = c.req.param('commentId');
    const body = await c.req.json();
    const { userId, userName, comment } = body;
    
    console.log('📝 Updating comment:', commentId, 'on place:', placeId);
    
    if (!placeId || !commentId || !userId || !userName || !comment) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Get existing comment to preserve original data
    const existingComment = await kv.get(`place_comments:${placeId}:${commentId}`);
    
    if (!existingComment) {
      return c.json({ error: "Comment not found" }, 404);
    }
    
    // Update comment object, preserving original createdAt and userId
    const updatedCommentData = {
      ...existingComment,
      comment,
      updatedAt: new Date().toISOString(),
    };
    
    // Store updated comment in KV with retry logic
    await retryKvOperation(
      () => kv.set(`place_comments:${placeId}:${commentId}`, updatedCommentData),
      'Comment update'
    );
    
    console.log('✅ Comment updated successfully:', commentId);
    
    return c.json({ comment: updatedCommentData });
  } catch (error) {
    console.error('❌ Unexpected error in /places/:placeId/comments/:commentId PUT:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete a comment (Admin only)
app.delete("/make-server-026f502c/places/:placeId/comments/:commentId", async (c) => {
  try {
    const placeId = c.req.param('placeId');
    const commentId = c.req.param('commentId');
    
    console.log('🗑️ Deleting comment:', commentId, 'on place:', placeId);
    
    if (!placeId || !commentId) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Delete comment from KV with retry logic
    await retryKvOperation(
      () => kv.del(`place_comments:${placeId}:${commentId}`),
      'Comment deletion'
    );
    
    console.log('✅ Comment deleted successfully:', commentId);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Unexpected error in /places/:placeId/comments/:commentId DELETE:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all comments across all places (Admin only)
app.get("/make-server-026f502c/admin/comments", async (c) => {
  try {
    console.log('📝 Loading all comments for admin');
    
    // Get all comments from KV store
    const allComments = await kv.getByPrefix('place_comments:');
    
    console.log('📝 Found', allComments?.length || 0, 'total comments');
    
    // Sort by created date (newest first)
    const comments = (allComments || [])
      .filter(c => c && c.id && c.userName && c.comment)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('📝 Returning', comments.length, 'valid comments');
    
    return c.json({ comments });
  } catch (error) {
    console.error('❌ Unexpected error in /admin/comments GET:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Submit ad request
app.post("/make-server-026f502c/ad-requests", async (c) => {
  try {
    const body = await c.req.json();
    const {
      businessName,
      contactEmail,
      contactPhone,
      adTitle,
      adDescription,
      targetCity,
      ctaText,
      ctaUrl,
      imageUrl,
      budget,
      additionalInfo,
      ethnicityId,
      userId,
    } = body;
    
    // Validation
    if (!businessName || !adTitle || !adDescription || !ctaText || !ctaUrl || !contactEmail || !userId) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Store ad request in KV store with prefix for easy retrieval
    const requestId = crypto.randomUUID();
    const requestKey = `ad-request:${requestId}`;
    
    await kv.set(requestKey, {
      id: requestId,
      businessName,
      contactEmail,
      contactPhone: contactPhone || '',
      adTitle,
      adDescription,
      targetCity: targetCity || '',
      ctaText,
      ctaUrl,
      imageUrl: imageUrl || '',
      budget: budget || '',
      additionalInfo: additionalInfo || '',
      ethnicityId,
      userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    
    console.log('✅ Ad request submitted:', requestId);
    
    return c.json({ 
      success: true, 
      requestId,
      message: 'Ad request submitted successfully' 
    });
  } catch (error) {
    console.error('Unexpected error in /ad-requests:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all ad requests (for admin)
app.get("/make-server-026f502c/ad-requests", async (c) => {
  try {
    const status = c.req.query('status'); // optional filter by status
    
    // Get all ad requests from KV store
    const allRequests = await kv.getByPrefix('ad-request:');
    
    let requests = allRequests.map((item: any) => item.value);
    
    // Filter by status if provided
    if (status) {
      requests = requests.filter((req: any) => req.status === status);
    }
    
    // Sort by creation date (newest first)
    requests.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ requests });
  } catch (error) {
    console.error('Unexpected error in /ad-requests GET:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update ad request status (for admin)
app.patch("/make-server-026f502c/ad-requests/:requestId", async (c) => {
  try {
    const requestId = c.req.param('requestId');
    const body = await c.req.json();
    const { status, adminNotes } = body;
    
    if (!requestId || !status) {
      return c.json({ error: "Missing requestId or status" }, 400);
    }
    
    // Get existing request
    const requestKey = `ad-request:${requestId}`;
    const existing = await kv.get(requestKey);
    
    if (!existing) {
      return c.json({ error: 'Ad request not found' }, 404);
    }
    
    // Update the request
    await kv.set(requestKey, {
      ...existing,
      status,
      adminNotes: adminNotes || existing.adminNotes || '',
      updatedAt: new Date().toISOString(),
    });
    
    console.log('✅ Ad request updated:', requestId, 'Status:', status);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in /ad-requests PATCH:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// STRIPE PREMIUM SUBSCRIPTION ROUTES
// ============================================

// Initialize Stripe
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
if (!stripeSecretKey) {
  console.warn('⚠️ STRIPE_SECRET_KEY not set. Premium features will not work.');
}
const stripe = stripeSecretKey ? initializeStripe(stripeSecretKey) : null;

// Stripe Price ID for premium subscription ($4.99/month)
// This will be created automatically or can be set via environment variable
let PREMIUM_PRICE_ID = Deno.env.get('STRIPE_PRICE_ID');

// Diagnostic endpoint to check Stripe configuration
app.get("/make-server-026f502c/stripe/status", (c) => {
  const hasSecretKey = !!Deno.env.get('STRIPE_SECRET_KEY');
  const hasPriceId = !!PREMIUM_PRICE_ID;
  const hasWebhookSecret = !!Deno.env.get('STRIPE_WEBHOOK_SECRET');

  return c.json({
    configured: hasSecretKey,
    hasSecretKey,
    hasPriceId,
    hasWebhookSecret,
    priceId: PREMIUM_PRICE_ID || 'Not set - will be created on first checkout',
    message: hasSecretKey
      ? 'Stripe is properly configured'
      : 'STRIPE_SECRET_KEY is missing. Please set it in environment variables.',
  });
});

// Create or get premium subscription price
app.post("/make-server-026f502c/stripe/initialize-price", async (c) => {
  try {
    if (!stripe) {
      return c.json({ error: 'Stripe not initialized' }, 500);
    }

    // Check if price ID is already set
    if (PREMIUM_PRICE_ID) {
      return c.json({ priceId: PREMIUM_PRICE_ID });
    }

    // Create new price
    const price = await stripe.createPrice({
      productName: 'Kynnect Premium',
      productDescription: 'Premium subscription with ad-free experience and exclusive features',
      amount: 499, // $4.99 in cents
      currency: 'usd',
      interval: 'month',
    });

    PREMIUM_PRICE_ID = price.id;
    console.log('✅ Created Stripe price:', PREMIUM_PRICE_ID);

    return c.json({ priceId: PREMIUM_PRICE_ID });
  } catch (error) {
    console.error('Error initializing Stripe price:', error);
    return c.json({ error: 'Failed to initialize Stripe price' }, 500);
  }
});

// Create Stripe checkout session for premium upgrade
app.post("/make-server-026f502c/create-checkout-session", async (c) => {
  try {
    if (!stripe) {
      return c.json({ error: 'Stripe not initialized. Please contact support.' }, 500);
    }

    const body = await c.req.json();
    const { userId } = body;

    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400);
    }

    // Get user email from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      return c.json({ error: 'User not found' }, 404);
    }

    // Ensure we have a price ID
    if (!PREMIUM_PRICE_ID) {
      console.log('⚠️ No price ID found, creating one...');
      try {
        // Create new price
        const price = await stripe.createPrice({
          productName: 'Kynnect Premium',
          amount: 499, // $4.99 in cents
          currency: 'usd',
          interval: 'month',
        });

        PREMIUM_PRICE_ID = price.id;
        console.log('✅ Created Stripe price:', PREMIUM_PRICE_ID);
      } catch (priceError) {
        console.error('❌ Error creating price:', priceError);
        console.error('Price error details:', JSON.stringify(priceError, null, 2));
        return c.json({
          error: 'Failed to initialize subscription pricing. Please contact support.',
          details: priceError instanceof Error ? priceError.message : 'Unknown error'
        }, 500);
      }
    }

    console.log('💳 Creating checkout session with price ID:', PREMIUM_PRICE_ID);

    // Create checkout session
    let session;
    try {
      session = await stripe.createCheckoutSession({
        customerEmail: userData.email,
        priceId: PREMIUM_PRICE_ID,
        successUrl: `${c.req.header('origin') || 'http://localhost:3000'}/settings?premium=success`,
        cancelUrl: `${c.req.header('origin') || 'http://localhost:3000'}/premium-upgrade?canceled=true`,
        metadata: {
          userId: userId,
        },
      });
    } catch (sessionError) {
      console.error('❌ Error creating checkout session:', sessionError);
      console.error('Session error details:', JSON.stringify(sessionError, null, 2));
      return c.json({
        error: 'Failed to create checkout session. Please contact support.',
        details: sessionError instanceof Error ? sessionError.message : 'Unknown error'
      }, 500);
    }

    console.log('✅ Created checkout session for user:', userId);
    console.log('🔗 Checkout URL:', session.url);

    if (!session.url) {
      console.error('❌ No checkout URL in session:', session);
      return c.json({ error: 'No checkout URL received from Stripe' }, 500);
    }

    return c.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('❌ Unexpected error in checkout session creation:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return c.json({
      error: 'An unexpected error occurred. Please try again or contact support.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Stripe webhook handler for subscription events
app.post("/make-server-026f502c/stripe/webhook", async (c) => {
  try {
    if (!stripe) {
      return c.json({ error: 'Stripe not initialized' }, 500);
    }

    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');

    if (!signature) {
      return c.json({ error: 'Missing stripe signature' }, 400);
    }

    // Parse webhook event
    const event = await stripe.constructWebhookEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    );

    console.log('📨 Received Stripe webhook:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const paymentType = session.metadata?.type;

        if (paymentType === 'event_promotion') {
          // Handle event promotion payment
          const eventId = session.metadata?.eventId;
          const packageId = session.metadata?.packageId;
          const price = parseFloat(session.metadata?.price || '0');

          if (userId && eventId && packageId) {
            // Store promotion as paid and approved
            await kv.set(`promotion:${eventId}`, {
              eventId,
              userId,
              packageId,
              price,
              status: 'paid',
              paidAt: new Date().toISOString(),
            });

            console.log('✅ Event promotion payment received:', eventId, packageId);
          }
        } else if (paymentType === 'business_ad') {
          // Handle business ad payment
          const adRequestId = session.metadata?.adRequestId;
          const amount = parseFloat(session.metadata?.amount || '0');

          if (userId && adRequestId) {
            // Update ad request to paid status
            const requestKey = `ad-request:${adRequestId}`;
            const existing = await kv.get(requestKey);
            
            if (existing) {
              await kv.set(requestKey, {
                ...existing,
                status: 'paid',
                paidAmount: amount,
                paidAt: new Date().toISOString(),
              });

              console.log('✅ Business ad payment received:', adRequestId);
            }
          }
        } else {
          // Handle premium subscription
          const subscriptionId = session.subscription;

          if (userId && subscriptionId) {
            // Mark user as premium in KV store
            await kv.set(`premium:${userId}`, {
              subscriptionId: subscriptionId,
              status: 'active',
              startedAt: new Date().toISOString(),
            });

            // Also update the users table
            const { error: dbError } = await supabase
              .from('users')
              .update({ is_premium: true })
              .eq('id', userId);

            if (dbError) {
              console.error('❌ Failed to update user premium status in database:', dbError);
            } else {
              console.log('✅ Updated user premium status in database');
            }

            console.log('✅ User upgraded to premium:', userId);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const premiumData = await kv.get(`premium:${userId}`);
          if (premiumData) {
            await kv.set(`premium:${userId}`, {
              ...premiumData,
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          // Mark subscription as canceled in KV store
          const premiumData = await kv.get(`premium:${userId}`);
          if (premiumData) {
            await kv.set(`premium:${userId}`, {
              ...premiumData,
              status: 'canceled',
              canceledAt: new Date().toISOString(),
            });
          }

          // Also update the users table to remove premium status
          const { error: dbError } = await supabase
            .from('users')
            .update({ is_premium: false })
            .eq('id', userId);

          if (dbError) {
            console.error('❌ Failed to remove user premium status in database:', dbError);
          } else {
            console.log('✅ Removed user premium status in database');
          }

          console.log('❌ User canceled premium:', userId);
        }
        break;
      }
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Get user's premium subscription status
app.get("/make-server-026f502c/premium-status/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');

    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400);
    }

    const premiumData = await kv.get(`premium:${userId}`);

    if (!premiumData) {
      return c.json({ isPremium: false });
    }

    // If subscription is active or in grace period
    const isPremium = premiumData.status === 'active' || premiumData.status === 'trialing';

    return c.json({
      isPremium,
      status: premiumData.status,
      subscriptionId: premiumData.subscriptionId,
      startedAt: premiumData.startedAt,
      currentPeriodEnd: premiumData.currentPeriodEnd,
    });
  } catch (error) {
    console.error('Error getting premium status:', error);
    return c.json({ error: 'Failed to get premium status' }, 500);
  }
});

// Cancel premium subscription
app.post("/make-server-026f502c/cancel-subscription", async (c) => {
  try {
    if (!stripe) {
      return c.json({ error: 'Stripe not initialized' }, 500);
    }

    const body = await c.req.json();
    const { userId } = body;

    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400);
    }

    // Get user's subscription
    const premiumData = await kv.get(`premium:${userId}`);

    if (!premiumData || !premiumData.subscriptionId) {
      return c.json({ error: 'No active subscription found' }, 404);
    }

    // Cancel subscription in Stripe (at period end)
    await stripe.cancelSubscription(premiumData.subscriptionId);

    // Update status in KV
    await kv.set(`premium:${userId}`, {
      ...premiumData,
      status: 'canceling',
      canceledAt: new Date().toISOString(),
    });

    console.log('✅ Subscription canceled for user:', userId);

    return c.json({ success: true, message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return c.json({ error: 'Failed to cancel subscription' }, 500);
  }
});

// ============================================
// ADVERTISING STRIPE PAYMENT ROUTES
// ============================================

// Create Stripe checkout for event promotion
app.post("/make-server-026f502c/create-promotion-checkout", async (c) => {
  try {
    if (!stripe) {
      return c.json({ error: 'Stripe not initialized. Please contact support.' }, 500);
    }

    const body = await c.req.json();
    const { userId, eventId, packageId, price, eventTitle } = body;

    if (!userId || !eventId || !packageId || !price) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get user email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user for promotion checkout:', userError);
      return c.json({ error: 'User not found' }, 404);
    }

    // Create one-time payment checkout session for event promotion
    const session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'customer_email': userData.email,
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': `Event Promotion: ${eventTitle}`,
        'line_items[0][price_data][product_data][description]': `${packageId} promotion package`,
        'line_items[0][price_data][unit_amount]': (price * 100).toString(),
        'line_items[0][quantity]': '1',
        'success_url': `${c.req.header('origin') || 'http://localhost:3000'}/event/${eventId}?promotion=success`,
        'cancel_url': `${c.req.header('origin') || 'http://localhost:3000'}/event/${eventId}?promotion=canceled`,
        'metadata[type]': 'event_promotion',
        'metadata[userId]': userId,
        'metadata[eventId]': eventId,
        'metadata[packageId]': packageId,
        'metadata[price]': price.toString(),
      }),
    });

    if (!session.ok) {
      const error = await session.text();
      console.error('Stripe checkout error:', error);
      return c.json({ error: 'Failed to create checkout session' }, 500);
    }

    const sessionData = await session.json();
    console.log('✅ Created promotion checkout session for event:', eventId);

    return c.json({ checkoutUrl: sessionData.url });
  } catch (error) {
    console.error('Error creating promotion checkout:', error);
    return c.json({ error: 'Failed to create checkout session' }, 500);
  }
});

// Create Stripe checkout for business ad
app.post("/make-server-026f502c/create-ad-checkout", async (c) => {
  try {
    if (!stripe) {
      return c.json({ error: 'Stripe not initialized. Please contact support.' }, 500);
    }

    const body = await c.req.json();
    const { userId, adRequestId, businessName, budget } = body;

    if (!userId || !adRequestId || !businessName || !budget) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get user email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user for ad checkout:', userError);
      return c.json({ error: 'User not found' }, 404);
    }

    // Parse budget to get amount
    const amount = parseInt(budget) || 99;

    // Create one-time payment checkout session for business ad
    const session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'customer_email': userData.email,
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': `Business Ad: ${businessName}`,
        'line_items[0][price_data][product_data][description]': 'Display ad in community feed',
        'line_items[0][price_data][unit_amount]': (amount * 100).toString(),
        'line_items[0][quantity]': '1',
        'success_url': `${c.req.header('origin') || 'http://localhost:3000'}/settings?ad=success`,
        'cancel_url': `${c.req.header('origin') || 'http://localhost:3000'}/admin/request-ad?ad=canceled`,
        'metadata[type]': 'business_ad',
        'metadata[userId]': userId,
        'metadata[adRequestId]': adRequestId,
        'metadata[amount]': amount.toString(),
      }),
    });

    if (!session.ok) {
      const error = await session.text();
      console.error('Stripe ad checkout error:', error);
      return c.json({ error: 'Failed to create checkout session' }, 500);
    }

    const sessionData = await session.json();
    console.log('✅ Created ad checkout session for:', businessName);

    return c.json({ checkoutUrl: sessionData.url });
  } catch (error) {
    console.error('Error creating ad checkout:', error);
    return c.json({ error: 'Failed to create checkout session' }, 500);
  }
});

// ============================================
// KV STORE ENDPOINTS FOR NOTIFICATION PREFERENCES
// ============================================

// Get a single key from KV store
app.get("/make-server-026f502c/kv/:key", async (c) => {
  try {
    const key = c.req.param('key');
    const value = await kv.get(key);
    
    if (value === null) {
      return c.json({ error: 'Key not found' }, 404);
    }
    
    return c.json({ value });
  } catch (error) {
    console.error('Error getting KV value:', error);
    return c.json({ error: 'Failed to get value' }, 500);
  }
});

// Set a single key in KV store
app.put("/make-server-026f502c/kv/:key", async (c) => {
  try {
    const key = c.req.param('key');
    const body = await c.req.json();
    
    await kv.set(key, body);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error setting KV value:', error);
    return c.json({ error: 'Failed to set value' }, 500);
  }
});

// Get multiple keys from KV store (batch)
app.post("/make-server-026f502c/kv/batch", async (c) => {
  try {
    const body = await c.req.json();
    const { keys } = body;
    
    if (!Array.isArray(keys)) {
      return c.json({ error: 'keys must be an array' }, 400);
    }
    
    const values = await kv.mget(keys);
    
    return c.json({ values });
  } catch (error) {
    console.error('Error getting batch KV values:', error);
    return c.json({ error: 'Failed to get values' }, 500);
  }
});

// ============================================
// FOLLOW REQUEST MANAGEMENT
// ============================================

// Accept a follow request (server-side with elevated permissions)
app.post("/make-server-026f502c/follows/accept", async (c) => {
  try {
    const body = await c.req.json();
    const { followerId, followingId } = body;

    if (!followerId || !followingId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    console.log('🎯 [Server] Accepting follow request:', { followerId, followingId });

    // First, verify the follow request exists
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    console.log('📋 [Server] Existing follow record:', existingFollow);

    if (checkError || !existingFollow) {
      console.error('❌ [Server] Follow request not found:', checkError);
      return c.json({ error: 'Follow request not found' }, 404);
    }

    // Update the status to accepted
    const { data: updateData, error: updateError } = await supabase
      .from('follows')
      .update({ status: 'accepted' })
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .select();

    console.log('📊 [Server] Update result:', { updateData, updateError });

    if (updateError) {
      console.error('❌ [Server] Accept follow error:', updateError);
      return c.json({ error: 'Failed to accept follow request' }, 500);
    }

    console.log('✅ [Server] Follow request updated to accepted');

    // Verify the update worked
    const { data: verifyData } = await supabase
      .from('follows')
      .select('status')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    console.log('✅ [Server] Verified status after update:', verifyData);

    // Get the user's info for notification
    const { data: userData } = await supabase
      .from('users')
      .select('name')
      .eq('id', followingId)
      .single();

    // Notify the follower that their request was accepted
    if (userData) {
      await supabase.from('notifications').insert({
        user_id: followerId,
        type: 'follow_accepted',
        from_user_id: followingId,
        message: `${userData.name} accepted your follow request`,
        read: false,
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ [Server] Unexpected error accepting follow request:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Reject a follow request (server-side with elevated permissions)
app.post("/make-server-026f502c/follows/reject", async (c) => {
  try {
    const body = await c.req.json();
    const { followerId, followingId } = body;

    if (!followerId || !followingId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    console.log('❌ [Server] Rejecting follow request:', { followerId, followingId });

    // First, verify the follow request exists
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    console.log('📋 [Server] Existing follow record to delete:', existingFollow);

    if (checkError || !existingFollow) {
      console.error('❌ [Server] Follow request not found:', checkError);
      return c.json({ error: 'Follow request not found' }, 404);
    }

    // Delete the follow request
    const { error: deleteError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (deleteError) {
      console.error('❌ [Server] Reject follow error:', deleteError);
      return c.json({ error: 'Failed to reject follow request' }, 500);
    }

    // Verify the deletion worked
    const { data: verifyData } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    console.log('✅ [Server] Verified deletion (should be null):', verifyData);

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ [Server] Unexpected error rejecting follow request:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// MESSAGE MANAGEMENT
// ============================================

// Send a message (server-side with elevated permissions)
app.post("/make-server-026f502c/messages/send", async (c) => {
  try {
    const body = await c.req.json();
    const { conversationId, senderId, text } = body;

    if (!conversationId || !senderId || !text) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    console.log('📤 [Server] Sending message:', { conversationId, senderId, textLength: text.length });

    // Get sender info
    const { data: senderData, error: senderError } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', senderId)
      .single();
    
    if (senderError) {
      console.error('❌ [Server] Failed to get sender data:', senderError);
      return c.json({ error: 'Failed to get sender data' }, 404);
    }

    console.log('👤 [Server] Sender data:', senderData);

    // Insert message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: text,
        read: false,
      })
      .select()
      .single();
    
    if (messageError) {
      console.error('❌ [Server] Send message error:', messageError);
      return c.json({ error: 'Failed to send message' }, 500);
    }

    console.log('✅ [Server] Message inserted:', messageData.id);

    // Return the message (conversation sorting will be based on last message time)
    const message = {
      id: messageData.id,
      conversationId: messageData.conversation_id,
      senderId: senderId,
      senderName: senderData.name,
      senderAvatar: senderData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderData.name}`,
      text: messageData.content,
      createdAt: messageData.created_at,
      read: messageData.read,
    };

    console.log('✅ [Server] Message sent successfully');
    return c.json({ message });
  } catch (error) {
    console.error('❌ [Server] Unexpected error sending message:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);
Deno.serve(app.fetch);