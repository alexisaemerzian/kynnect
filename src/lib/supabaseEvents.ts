import { supabase } from './supabase';
import { Event, EventRSVP, Comment } from '../app/types';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ============================================
// EVENT MANAGEMENT
// ============================================

export interface CreateEventInput {
  title: string;
  description: string;
  type: 'curated' | 'spontaneous';
  city: string;
  location: string;
  date: string;
  time?: string;
  address?: string;
  maxAttendees?: number;
  tags?: string[];
  coordinates?: { lat: number; lng: number };
  showAddress?: boolean;
  ethnicityId: string;
  imageFile?: File;
  addressVisibility?: 'public' | 'rsvp_required';
}

export async function createEvent(
  input: CreateEventInput,
  userId: string
): Promise<{ event: Event | null; error: string | null }> {
  try {
    // 1. Upload image if provided
    let imageUrl = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622'; // default
    
    if (input.imageFile) {
      console.log('📤 Uploading image...');
      const fileExt = input.imageFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('make-026f502c-event-images')
        .upload(fileName, input.imageFile);
      
      if (uploadError) {
        console.error('⚠️ Image upload error (using default image):', uploadError);
        // Continue with default image instead of failing
      } else {
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('make-026f502c-event-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
        console.log('✅ Image uploaded successfully:', imageUrl);
      }
    }
    
    // 2. Get user data for host info - use server endpoint to bypass RLS
    console.log('👤 Fetching user data for:', userId);

    const userController = new AbortController();
    const userTimeoutId = setTimeout(() => userController.abort(), 5000); // 5 second timeout

    let userResponse;
    try {
      userResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          signal: userController.signal,
        }
      );
    } catch (error: any) {
      clearTimeout(userTimeoutId);
      if (error.name === 'AbortError') {
        console.error('❌ User fetch timeout');
        return { event: null, error: 'Failed to load user data. Please try again.' };
      }
      throw error;
    } finally {
      clearTimeout(userTimeoutId);
    }

    if (!userResponse.ok) {
      console.error('❌ User fetch error:', await userResponse.json());
      return { event: null, error: 'Failed to fetch user data' };
    }

    const { user: userData } = await userResponse.json();

    if (!userData) {
      console.error('No user data found for ID:', userId);
      return { event: null, error: 'User not found' };
    }
    
    // 3. Create event via server endpoint to bypass RLS
    console.log('📝 Creating event...');

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    let eventResponse;
    try {
      eventResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: input.title,
            description: input.description,
            type: input.type,
            city: input.city,
            location: input.location,
            date: input.date,
            time: input.time,
            address: input.address,
            hostId: userId,
            maxAttendees: input.maxAttendees,
            imageUrl: imageUrl,
            tags: input.tags,
            coordinatesLat: input.coordinates?.lat,
            coordinatesLng: input.coordinates?.lng,
            showAddress: input.showAddress ?? false,
            ethnicityId: input.ethnicityId,
            // Only send addressVisibility if explicitly provided
            ...(input.addressVisibility ? { addressVisibility: input.addressVisibility } : {}),
          }),
          signal: controller.signal,
        }
      );
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('❌ Event creation timeout');
        return { event: null, error: 'Request took too long. Please try again.' };
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
    
    if (!eventResponse.ok) {
      const errorData = await eventResponse.json();
      console.error('❌ Event creation error:', errorData);
      return { event: null, error: errorData.error || 'Failed to create event' };
    }
    
    const { event: eventData } = await eventResponse.json();
    console.log('✅ Event created successfully:', eventData.id);
    
    // 4. Transform to frontend Event type
    const event: Event = {
      id: eventData.id,
      title: eventData.title,
      description: eventData.description,
      type: eventData.type,
      city: eventData.city,
      location: eventData.location,
      date: eventData.date,
      time: eventData.time,
      address: eventData.address,
      host: {
        id: userId,
        name: userData.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
        isOrganization: userData.is_organization,
        organizationName: userData.organization_name,
        organizationType: userData.organization_type,
      },
      attendees: 1, // Host is always attending
      maxAttendees: eventData.max_attendees,
      imageUrl: eventData.image_url,
      tags: eventData.tags,
      coordinates: eventData.coordinates_lat && eventData.coordinates_lng ? {
        lat: eventData.coordinates_lat,
        lng: eventData.coordinates_lng,
      } : undefined,
      showAddress: eventData.show_address,
      createdAt: eventData.created_at,
      rsvps: [],
      comments: [],
    };
    
    return { event, error: null };
  } catch (error) {
    console.error('❌ Unexpected error creating event:', error);
    return { event: null, error: 'An unexpected error occurred' };
  }
}

export async function getEventsByEthnicity(
  ethnicityId: string
): Promise<{ events: Event[]; error: string | null }> {
  try {
    console.log('🔍 Fetching events for ethnicity:', ethnicityId);
    console.log('🌐 Server URL:', `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events?ethnicityId=${ethnicityId}`);
    
    // Use server endpoint to bypass RLS with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events?ethnicityId=${ethnicityId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Events fetch error:', errorData);
        
        // FALLBACK: Try fetching directly from Supabase client
        console.log('🔄 Trying fallback: direct Supabase query...');
        return await getEventsByEthnicityFallback(ethnicityId);
      }
      
      const { events: eventsData, rsvps: rsvpsData } = await response.json();
      console.log('✅ Events fetched from server:', eventsData?.length || 0);
      
      if (!eventsData) {
        return { events: [], error: null };
      }
      
      // Get comments for all events
      const eventIds = eventsData.map((e: any) => e.id);
      const { data: commentsDataRaw } = await supabase
        .from('comments')
        .select('*')
        .in('event_id', eventIds)
        .order('created_at', { ascending: true });
      
      // Fetch user data for comments
      const commentUserIds = [...new Set((commentsDataRaw || []).map((c: any) => c.user_id))];
      const { data: commentUsersData } = commentUserIds.length > 0
        ? await supabase
            .from('users')
            .select('id, name')
            .in('id', commentUserIds)
        : { data: [] };
      
      // Attach user data to comments
      const commentsData = (commentsDataRaw || []).map((comment: any) => ({
        ...comment,
        user: commentUsersData?.find((u: any) => u.id === comment.user_id) || null,
      }));
      
      // Transform to frontend Event type
      const events: Event[] = eventsData
        .filter((eventData: any) => eventData.ethnicity_id === ethnicityId)
        .map((eventData: any) => {
          const eventRsvps = rsvpsData?.filter((r: any) => r.event_id === eventData.id) || [];
          const eventComments = commentsData?.filter((c: any) => c.event_id === eventData.id) || [];
          
          // Count accepted RSVPs + 1 for the host (host is always attending)
          const acceptedCount = eventRsvps.filter((r: any) => r.status === 'accepted').length + 1;
          
          return {
            id: eventData.id,
            title: eventData.title,
            description: eventData.description,
            type: eventData.type,
            city: eventData.city,
            location: eventData.location,
            date: eventData.date,
            time: eventData.time,
            address: eventData.address,
            host: {
              id: eventData.host.id,
              name: eventData.host.name,
              avatar: eventData.host.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
              isOrganization: eventData.host.is_organization,
              organizationName: eventData.host.organization_name,
              organizationType: eventData.host.organization_type,
            },
            attendees: acceptedCount,
            maxAttendees: eventData.max_attendees,
            imageUrl: eventData.image_url,
            tags: eventData.tags,
            coordinates: eventData.coordinates_lat && eventData.coordinates_lng ? {
              lat: eventData.coordinates_lat,
              lng: eventData.coordinates_lng,
            } : undefined,
            showAddress: eventData.show_address,
            createdAt: eventData.created_at,
            rsvps: eventRsvps.map((rsvp: any) => ({
              userId: rsvp.user_id,
              userName: rsvp.user?.name || 'Unknown',
              userAvatar: rsvp.user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
              status: rsvp.status,
              requestedAt: rsvp.requested_at,
            })),
            comments: eventComments.map((comment: any) => ({
              id: comment.id,
              userId: comment.user_id,
              userName: comment.user?.name || 'Unknown',
              userAvatar: comment.user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
              text: comment.text,
              createdAt: comment.created_at,
              isHost: comment.user_id === eventData.host_id,
            })),
          };
        });
      
      return { events, error: null };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ Fetch timeout - falling back to direct query');
      } else {
        console.error('❌ Fetch error:', fetchError);
      }
      
      // FALLBACK: Try fetching directly from Supabase client
      console.log('🔄 Trying fallback: direct Supabase query...');
      return await getEventsByEthnicityFallback(ethnicityId);
    }
  } catch (error) {
    console.error('❌ Unexpected error fetching events:', error);
    return { events: [], error: 'An unexpected error occurred' };
  }
}

async function getEventsByEthnicityFallback(
  ethnicityId: string
): Promise<{ events: Event[]; error: string | null }> {
  try {
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select(`
        *,
        host:users!host_id(id, name, is_organization, organization_name, organization_type)
      `)
      .eq('ethnicity_id', ethnicityId);
    
    if (eventsError) {
      console.error('Events fetch error:', eventsError);
      return { events: [], error: 'Failed to load events' };
    }
    
    // Get RSVPs for all events
    const eventIds = eventsData.map((e: any) => e.id);
    const { data: rsvpsData } = await supabase
      .from('event_rsvps')
      .select(`
        *,
        user:users!user_id(name)
      `)
      .in('event_id', eventIds);
    
    // Get comments for all events
    const { data: commentsData } = await supabase
      .from('comments')
      .select(`
        *,
        user:users!user_id(name)
      `)
      .in('event_id', eventIds)
      .order('created_at', { ascending: true });
    
    // Transform to frontend Event type
    const events: Event[] = eventsData.map((eventData: any) => {
      const eventRsvps = rsvpsData?.filter((r: any) => r.event_id === eventData.id) || [];
      const eventComments = commentsData?.filter((c: any) => c.event_id === eventData.id) || [];
      
      // Count accepted RSVPs + 1 for the host (host is always attending)
      const acceptedCount = eventRsvps.filter((r: any) => r.status === 'accepted').length + 1;
      
      return {
        id: eventData.id,
        title: eventData.title,
        description: eventData.description,
        type: eventData.type,
        city: eventData.city,
        location: eventData.location,
        date: eventData.date,
        time: eventData.time,
        address: eventData.address,
        host: {
          id: eventData.host.id,
          name: eventData.host.name,
          avatar: eventData.host.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
          isOrganization: eventData.host.is_organization,
          organizationName: eventData.host.organization_name,
          organizationType: eventData.host.organization_type,
        },
        attendees: acceptedCount,
        maxAttendees: eventData.max_attendees,
        imageUrl: eventData.image_url,
        tags: eventData.tags,
        coordinates: eventData.coordinates_lat && eventData.coordinates_lng ? {
          lat: eventData.coordinates_lat,
          lng: eventData.coordinates_lng,
        } : undefined,
        showAddress: eventData.show_address,
        createdAt: eventData.created_at,
        rsvps: eventRsvps.map((rsvp: any) => ({
          userId: rsvp.user_id,
          userName: rsvp.user.name,
          userAvatar: rsvp.user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
          status: rsvp.status,
          requestedAt: rsvp.requested_at,
        })),
        comments: eventComments.map((comment: any) => ({
          id: comment.id,
          userId: comment.user_id,
          userName: comment.user.name,
          userAvatar: comment.user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
          text: comment.text,
          createdAt: comment.created_at,
          isHost: comment.user_id === eventData.host_id,
        })),
      };
    });
    
    return { events, error: null };
  } catch (error) {
    console.error('Unexpected error fetching events:', error);
    return { events: [], error: 'An unexpected error occurred' };
  }
}

export async function getEventById(
  eventId: string
): Promise<{ event: Event | null; error: string | null }> {
  try {
    console.log('🔍 Fetching event by ID:', eventId);
    
    // Use server endpoint FIRST to bypass RLS
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events/${eventId}`;
    console.log('📡 Request URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server error fetching event:', errorText);
      
      // FALLBACK: Try direct Supabase query
      console.log('🔄 Trying fallback: direct Supabase query...');
      return await getEventByIdFallback(eventId);
    }

    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (!data.event) {
      console.error('❌ No event in response');
      // Try fallback before giving up
      console.log('🔄 Trying fallback: direct Supabase query...');
      return await getEventByIdFallback(eventId);
    }

    const eventData = data.event;
    const rsvpsData = data.rsvps || [];
    
    // Get comments separately using Supabase (comments table doesn't have RLS issues)
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        user:users!user_id(name, avatar)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.warn('⚠️ Error fetching comments:', commentsError);
    }
    
    console.log('💬 Comments data:', commentsData);
    
    // Count accepted RSVPs + 1 for the host (host is always attending)
    const acceptedCount = rsvpsData.filter((r: any) => r.status === 'accepted').length + 1;
    
    const event: Event = {
      id: eventData.id,
      title: eventData.title,
      description: eventData.description,
      type: eventData.type,
      city: eventData.city,
      location: eventData.location,
      date: eventData.date,
      time: eventData.time,
      address: eventData.address,
      host: {
        id: eventData.host.id,
        name: eventData.host.name,
        avatar: eventData.host.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        isOrganization: eventData.host.is_organization,
        organizationName: eventData.host.organization_name,
        organizationType: eventData.host.organization_type,
      },
      attendees: acceptedCount,
      maxAttendees: eventData.max_attendees,
      imageUrl: eventData.image_url,
      tags: eventData.tags,
      coordinates: eventData.coordinates_lat && eventData.coordinates_lng ? {
        lat: eventData.coordinates_lat,
        lng: eventData.coordinates_lng,
      } : undefined,
      showAddress: eventData.show_address,
      createdAt: eventData.created_at,
      rsvps: rsvpsData.map((rsvp: any) => ({
        userId: rsvp.user_id,
        userName: rsvp.user?.name || 'Unknown',
        userAvatar: rsvp.user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        status: rsvp.status,
        requestedAt: rsvp.requested_at,
      })),
      comments: (commentsData || []).map((comment: any) => ({
        id: comment.id,
        userId: comment.user_id,
        userName: comment.user?.name || 'Unknown User',
        userAvatar: comment.user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        text: comment.text,
        createdAt: comment.created_at,
        isHost: comment.user_id === eventData.host_id,
      })),
    };
    
    console.log('✅ Successfully transformed event data:', event);
    
    return { event, error: null };
  } catch (error) {
    console.error('❌ Unexpected error fetching event:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Try fallback as last resort
    console.log('🔄 Trying fallback after error...');
    return await getEventByIdFallback(eventId);
  }
}

async function getEventByIdFallback(
  eventId: string
): Promise<{ event: Event | null; error: string | null }> {
  try {
    console.log('🔄 FALLBACK: Fetching event directly from Supabase');
    
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        host:users!host_id(id, name, avatar, is_organization, organization_name, organization_type)
      `)
      .eq('id', eventId)
      .single();
    
    if (eventError) {
      console.error('❌ Fallback fetch error:', eventError);
      return { event: null, error: 'Event not found' };
    }
    
    if (!eventData) {
      return { event: null, error: 'Event not found' };
    }
    
    // Get RSVPs
    const { data: rsvpsData } = await supabase
      .from('event_rsvps')
      .select(`
        *,
        user:users!user_id(name, avatar_url)
      `)
      .eq('event_id', eventId);
    
    // Get comments
    const { data: commentsData } = await supabase
      .from('comments')
      .select(`
        *,
        user:users!user_id(name, avatar_url)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });
    
    // Count accepted RSVPs + 1 for the host (host is always attending)
    const acceptedCount = (rsvpsData || []).filter((r: any) => r.status === 'accepted').length + 1;
    
    const event: Event = {
      id: eventData.id,
      title: eventData.title,
      description: eventData.description,
      type: eventData.type,
      city: eventData.city,
      location: eventData.location,
      date: eventData.date,
      time: eventData.time,
      address: eventData.address,
      host: {
        id: eventData.host.id,
        name: eventData.host.name,
        avatar: eventData.host.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        isOrganization: eventData.host.is_organization,
        organizationName: eventData.host.organization_name,
        organizationType: eventData.host.organization_type,
      },
      attendees: acceptedCount,
      maxAttendees: eventData.max_attendees,
      imageUrl: eventData.image_url,
      tags: eventData.tags,
      coordinates: eventData.coordinates_lat && eventData.coordinates_lng ? {
        lat: eventData.coordinates_lat,
        lng: eventData.coordinates_lng,
      } : undefined,
      showAddress: eventData.show_address,
      createdAt: eventData.created_at,
      rsvps: (rsvpsData || []).map((rsvp: any) => ({
        userId: rsvp.user_id,
        userName: rsvp.user?.name || 'Unknown',
        userAvatar: rsvp.user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        status: rsvp.status,
        requestedAt: rsvp.requested_at,
      })),
      comments: (commentsData || []).map((comment: any) => ({
        id: comment.id,
        userId: comment.user_id,
        userName: comment.user?.name || 'Unknown User',
        userAvatar: comment.user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        text: comment.text,
        createdAt: comment.created_at,
        isHost: comment.user_id === eventData.host_id,
      })),
    };
    
    console.log('✅ FALLBACK: Successfully fetched event');
    return { event, error: null };
  } catch (error) {
    console.error('❌ FALLBACK: Error fetching event:', error);
    return { event: null, error: 'An unexpected error occurred' };
  }
}

export async function deleteEvent(
  eventId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Verify user is the host
    const { data: eventData, error: fetchError } = await supabase
      .from('events')
      .select('host_id')
      .eq('id', eventId)
      .single();
    
    if (fetchError || eventData.host_id !== userId) {
      return { success: false, error: 'You can only delete your own events' };
    }
    
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (deleteError) {
      console.error('Event deletion error:', deleteError);
      return { success: false, error: 'Failed to delete event' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting event:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================
// RSVP MANAGEMENT
// ============================================

export async function createRSVP(
  eventId: string,
  userId: string
): Promise<{ rsvp: EventRSVP | null; error: string | null }> {
  try {
    // Check if RSVP already exists
    const { data: existingRSVP } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
    
    if (existingRSVP) {
      return { rsvp: null, error: 'You already requested to join this event' };
    }
    
    // Ensure user profile exists before creating RSVP
    console.log('🔍 [createRSVP] Ensuring user profile exists for:', userId);
    
    // Get current user session to get email
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser || !authUser.email) {
      console.error('❌ [createRSVP] No authenticated user found');
      return { rsvp: null, error: 'User not authenticated' };
    }
    
    // Create/ensure user profile exists via server endpoint
    const profileResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/users/profile`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          userId: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email.split('@')[0],
          ethnicityId: authUser.user_metadata?.ethnicity_id || 'armenian',
        }),
      }
    );
    
    if (!profileResponse.ok) {
      const error = await profileResponse.json();
      console.error('❌ [createRSVP] Profile creation error:', error);
      return { rsvp: null, error: 'Failed to create user profile' };
    }
    
    console.log('✅ [createRSVP] User profile exists');
    
    // Get user data - use server endpoint to bypass RLS
    const userResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );
    
    if (!userResponse.ok) {
      console.error('❌ User fetch error:', await userResponse.json());
      return { rsvp: null, error: 'Failed to fetch user data' };
    }
    
    const { user: userData } = await userResponse.json();
    
    // Create RSVP
    const { data: rsvpData, error: rsvpError } = await supabase
      .from('event_rsvps')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: 'pending',
      })
      .select()
      .single();
    
    if (rsvpError) {
      console.error('RSVP creation error:', rsvpError);
      return { rsvp: null, error: 'Failed to create RSVP' };
    }
    
    const rsvp: EventRSVP = {
      userId: userId,
      userName: userData.name,
      userAvatar: userData.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      status: 'pending',
      requestedAt: rsvpData.requested_at,
    };
    
    return { rsvp, error: null };
  } catch (error) {
    console.error('Unexpected error creating RSVP:', error);
    return { rsvp: null, error: 'An unexpected error occurred' };
  }
}

export async function updateRSVPStatus(
  eventId: string,
  userId: string,
  status: 'accepted' | 'declined',
  hostId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('🔄 [updateRSVPStatus] Calling server endpoint...', { eventId, userId, status, hostId });
    
    // Call server endpoint instead of using Supabase directly
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events/${eventId}/rsvps/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ status, hostId }),
      }
    );
    
    console.log('📡 [updateRSVPStatus] Server response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [updateRSVPStatus] Server error:', errorData);
      return { success: false, error: errorData.error || 'Failed to update RSVP' };
    }
    
    const data = await response.json();
    console.log('✅ [updateRSVPStatus] RSVP updated successfully:', data);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ [updateRSVPStatus] Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteRSVP(
  eventId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error: deleteError } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('RSVP deletion error:', deleteError);
      return { success: false, error: 'Failed to delete RSVP' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting RSVP:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================
// COMMENT MANAGEMENT
// ============================================

export async function addComment(
  eventId: string,
  userId: string,
  text: string
): Promise<{ comment: Comment | null; error: string | null }> {
  try {
    // Use server endpoint to bypass RLS - anyone logged in can comment
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events/${eventId}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          userId,
          text,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Comment creation error:', errorData);
      return { comment: null, error: errorData.error || 'Failed to add comment' };
    }

    const { comment: commentData } = await response.json();

    const comment: Comment = {
      id: commentData.id,
      userId: commentData.userId,
      userName: commentData.userName,
      userAvatar: commentData.userAvatar,
      text: commentData.text,
      createdAt: commentData.createdAt,
      isHost: false,
    };

    return { comment, error: null };
  } catch (error) {
    console.error('Unexpected error adding comment:', error);
    return { comment: null, error: 'An unexpected error occurred' };
  }
}

export async function deleteComment(
  commentId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Verify user is the comment author
    const { data: commentData, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();
    
    if (fetchError || commentData.user_id !== userId) {
      return { success: false, error: 'You can only delete your own comments' };
    }
    
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    if (deleteError) {
      console.error('Comment deletion error:', deleteError);
      return { success: false, error: 'Failed to delete comment' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting comment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}