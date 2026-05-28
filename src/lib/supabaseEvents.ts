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
    console.log('📝 Creating event directly in database...');

    // 1. Get user data first
    console.log('👤 Fetching user data for:', userId);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('❌ User fetch error:', userError);
      return { event: null, error: 'Failed to load user data. Please try again.' };
    }

    console.log('✅ User data loaded:', userData.name);

    // 2. Default image (skip upload for now)
    const imageUrl = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622';

    // 3. Create event directly in database
    console.log('📝 Inserting event into database...');

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert({
        title: input.title,
        description: input.description,
        type: input.type,
        city: input.city,
        location: input.location,
        date: input.date,
        time: input.time,
        address: input.address || input.location,
        host_id: userId,
        max_attendees: input.maxAttendees,
        image_url: imageUrl,
        tags: input.tags,
        coordinates_lat: input.coordinates?.lat,
        coordinates_lng: input.coordinates?.lng,
        show_address: input.showAddress ?? false,
        ethnicity_id: input.ethnicityId,
      })
      .select()
      .single();

    if (eventError) {
      console.error('❌ Event creation error:', eventError);
      return { event: null, error: eventError.message || 'Failed to create event' };
    }

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
        avatar: userData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
        isOrganization: userData.is_organization,
        organizationName: userData.organization_name,
        organizationType: userData.organization_type,
      },
      attendees: 1,
      maxAttendees: eventData.max_attendees,
      imageUrl: eventData.image_url,
      tags: eventData.tags,
      coordinates: eventData.coordinates_lat && eventData.coordinates_lng ? {
        lat: eventData.coordinates_lat,
        lng: eventData.coordinates_lng,
      } : undefined,
      showAddress: eventData.show_address,
      createdAt: eventData.created_at,
    };

    return { event, error: null };
  } catch (error: any) {
    console.error('❌ Unexpected error creating event:', error);
    return { event: null, error: error.message || 'Failed to create event' };
  }
}

// Update event
export async function updateEvent(
  eventId: string,
  userId: string,
  updates: {
    title?: string;
    description?: string;
    location?: string;
    city?: string;
    date?: string;
    time?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .eq('host_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error updating event:', error);
    return { success: false, error: error.message };
  }
}

// Delete event
export async function deleteEvent(eventId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('host_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return { success: false, error: error.message };
  }
}

// Get all events
export async function getEvents(ethnicityId?: string): Promise<{ events: Event[]; error: string | null }> {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (ethnicityId) {
      query = query.eq('ethnicity_id', ethnicityId);
    }

    const { data: eventsData, error } = await query;

    if (error) throw error;

    const events: Event[] = eventsData.map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      type: e.type,
      city: e.city,
      location: e.location,
      date: e.date,
      time: e.time,
      address: e.address,
      host: {
        id: e.host_id,
        name: 'Loading...',
        avatar: '',
      },
      attendees: 0,
      maxAttendees: e.max_attendees,
      imageUrl: e.image_url,
      tags: e.tags,
      coordinates: e.coordinates_lat && e.coordinates_lng ? {
        lat: e.coordinates_lat,
        lng: e.coordinates_lng,
      } : undefined,
      showAddress: e.show_address,
      createdAt: e.created_at,
    }));

    return { events, error: null };
  } catch (error: any) {
    console.error('Error getting events:', error);
    return { events: [], error: error.message };
  }
}

// Get single event
export async function getEvent(eventId: string): Promise<{ event: Event | null; error: string | null }> {
  try {
    const { data: eventData, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;

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
        id: eventData.host_id,
        name: 'Loading...',
        avatar: '',
      },
      attendees: 0,
      maxAttendees: eventData.max_attendees,
      imageUrl: eventData.image_url,
      tags: eventData.tags,
      coordinates: eventData.coordinates_lat && eventData.coordinates_lng ? {
        lat: eventData.coordinates_lat,
        lng: eventData.coordinates_lng,
      } : undefined,
      showAddress: eventData.show_address,
      createdAt: eventData.created_at,
    };

    return { event, error: null };
  } catch (error: any) {
    console.error('Error getting event:', error);
    return { event: null, error: error.message };
  }
}

// RSVP to event
export async function rsvpToEvent(eventId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('event_rsvps')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: 'pending',
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error RSVPing to event:', error);
    return { success: false, error: error.message };
  }
}

// Cancel RSVP
export async function cancelRSVP(eventId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error canceling RSVP:', error);
    return { success: false, error: error.message };
  }
}

// Update RSVP status (for hosts to approve/decline)
export async function updateRSVPStatus(
  eventId: string,
  userId: string,
  status: 'accepted' | 'declined',
  hostId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('event_rsvps')
      .update({ status })
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error updating RSVP status:', error);
    return { success: false, error: error.message };
  }
}

// Get event RSVPs
export async function getEventRSVPs(eventId: string): Promise<{ rsvps: EventRSVP[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId);

    if (error) throw error;

    const rsvps: EventRSVP[] = data.map((r: any) => ({
      userId: r.user_id,
      userName: 'Loading...',
      status: r.status,
      requestedAt: r.requested_at,
    }));

    return { rsvps, error: null };
  } catch (error: any) {
    console.error('Error getting RSVPs:', error);
    return { rsvps: [], error: error.message };
  }
}

// Add comment to event
export async function addEventComment(
  eventId: string,
  userId: string,
  text: string
): Promise<{ comment: Comment | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        event_id: eventId,
        user_id: userId,
        text: text,
      })
      .select()
      .single();

    if (error) throw error;

    const comment: Comment = {
      id: data.id,
      userId: userId,
      userName: 'You',
      userAvatar: '',
      text: data.text,
      createdAt: data.created_at,
      isHost: false,
    };

    return { comment, error: null };
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return { comment: null, error: error.message };
  }
}

// Get event comments
export async function getEventComments(eventId: string): Promise<{ comments: Comment[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const comments: Comment[] = data.map((c: any) => ({
      id: c.id,
      userId: c.user_id,
      userName: 'Loading...',
      userAvatar: '',
      text: c.text,
      createdAt: c.created_at,
      isHost: false,
    }));

    return { comments, error: null };
  } catch (error: any) {
    console.error('Error getting comments:', error);
    return { comments: [], error: error.message };
  }
}

// Notify followers of new event
export async function notifyFollowersOfNewEvent(
  userId: string,
  eventId: string,
  eventTitle: string,
  followerIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const notifications = followerIds.map(followerId => ({
      user_id: followerId,
      type: 'new_event',
      from_user_id: userId,
      event_id: eventId,
      message: `posted a new event: ${eventTitle}`,
      read: false,
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error notifying followers:', error);
    return { success: false, error: error.message };
  }
}

// Get followers who want notifications for this city
export async function getNotifiableFollowers(
  userId: string,
  followerIds: string[]
): Promise<{ followerIds: string[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email_notifications')
      .in('id', followerIds);

    if (error) throw error;

    const notifiableFollowerIds = data
      .filter((user: any) => user.email_notifications !== false)
      .map((user: any) => user.id);

    return { followerIds: notifiableFollowerIds };
  } catch (error: any) {
    console.error('Error getting notifiable followers:', error);
    return { followerIds: [], error: error.message };
  }
}
