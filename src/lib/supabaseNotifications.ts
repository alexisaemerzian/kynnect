import { supabase } from './supabase';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ============================================
// NOTIFICATION MANAGEMENT
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: 'new_event' | 'follow';
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  eventId?: string;
  eventTitle?: string;
  message: string;
  read: boolean;
  createdAt: string;
  isOrganization?: boolean;
}

export async function getNotifications(
  userId: string
): Promise<{ notifications: Notification[]; error: string | null }> {
  try {
    // Use server endpoint to bypass RLS
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/notifications/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Get notifications error:', errorData);
      return { notifications: [], error: errorData.error || 'Failed to load notifications' };
    }
    
    const { notifications: data } = await response.json();
    
    const notifications: Notification[] = (data || []).map((notif: any) => ({
      id: notif.id,
      userId: notif.user_id,
      type: notif.type,
      fromUserId: notif.from_user_id,
      fromUserName: notif.from_user?.name || 'Unknown',
      fromUserAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.from_user?.name || 'default'}`,
      eventId: notif.event_id,
      eventTitle: notif.event?.title,
      message: notif.message,
      read: notif.read,
      createdAt: notif.created_at,
      isOrganization: notif.from_user?.is_organization || false,
    }));
    
    return { notifications, error: null };
  } catch (error) {
    console.error('❌ Unexpected error getting notifications:', error);
    return { notifications: [], error: 'An unexpected error occurred' };
  }
}

export async function getUnreadCount(
  userId: string
): Promise<{ count: number; error: string | null }> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Get unread count error:', error);
      return { count: 0, error: 'Failed to get unread count' };
    }
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Unexpected error getting unread count:', error);
    return { count: 0, error: 'An unexpected error occurred' };
  }
}

export async function markAsRead(
  notificationId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Mark as read error:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error marking as read:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function markAllAsRead(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Mark all as read error:', error);
      return { success: false, error: 'Failed to mark all as read' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error marking all as read:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteNotification(
  notificationId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', notificationId); // Ensure user owns the notification
    
    if (error) {
      console.error('Delete notification error:', error);
      return { success: false, error: 'Failed to delete notification' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting notification:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function clearAllNotifications(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Clear all notifications error:', error);
      return { success: false, error: 'Failed to clear all notifications' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error clearing all notifications:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function createNotification(
  userId: string,
  type: 'new_event' | 'follow',
  fromUserId: string,
  message: string,
  eventId?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        from_user_id: fromUserId,
        event_id: eventId,
        message,
        read: false,
      });
    
    if (error) {
      console.error('Create notification error:', error);
      return { success: false, error: 'Failed to create notification' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error creating notification:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function notifyFollowersOfNewEvent(
  hostId: string,
  eventId: string,
  eventTitle: string,
  followerIds: string[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    if (followerIds.length === 0) {
      return { success: true, error: null };
    }
    
    const notifications = followerIds.map(followerId => ({
      user_id: followerId,
      type: 'new_event' as const,
      from_user_id: hostId,
      event_id: eventId,
      message: `New event: ${eventTitle}`,
      read: false,
    }));
    
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);
    
    if (insertError) {
      console.error('Notify followers error:', insertError);
      return { success: false, error: 'Failed to notify followers' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error notifying followers:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Real-time subscription for notifications
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
): () => void {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        // Use server endpoint to fetch full notification data
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/notifications/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (response.ok) {
          const { notifications } = await response.json();
          const newNotif = notifications.find((n: any) => n.id === payload.new.id);
          
          if (newNotif) {
            callback({
              id: newNotif.id,
              userId: newNotif.user_id,
              type: newNotif.type,
              fromUserId: newNotif.from_user_id,
              fromUserName: newNotif.from_user?.name || 'Unknown',
              fromUserAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newNotif.from_user?.name || 'default'}`,
              eventId: newNotif.event_id,
              eventTitle: newNotif.event?.title,
              message: newNotif.message,
              read: newNotif.read,
              createdAt: newNotif.created_at,
              isOrganization: newNotif.from_user?.is_organization || false,
            });
          }
        }
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}