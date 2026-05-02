import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ============================================
// FOLLOWER NOTIFICATION PREFERENCES
// Using KV store to track per-follower notification settings
// ============================================

/**
 * Get notification preference for a specific follower
 * @param hostId - The ID of the host/user being followed
 * @param followerId - The ID of the follower
 * @returns true if notifications are enabled (default), false if disabled
 */
export async function getFollowerNotificationPreference(
  hostId: string,
  followerId: string
): Promise<{ enabled: boolean; error: string | null }> {
  try {
    const key = `notification_pref_${hostId}_${followerId}`;
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/kv/${key}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        // No preference set, default to enabled
        return { enabled: true, error: null };
      }
      return { enabled: true, error: 'Failed to load preference' };
    }
    
    const data = await response.json();
    return { enabled: data.value?.enabled ?? true, error: null };
  } catch (error) {
    console.error('Error getting follower notification preference:', error);
    return { enabled: true, error: 'An unexpected error occurred' };
  }
}

/**
 * Set notification preference for a specific follower
 * @param hostId - The ID of the host/user being followed
 * @param followerId - The ID of the follower
 * @param enabled - Whether notifications should be enabled
 */
export async function setFollowerNotificationPreference(
  hostId: string,
  followerId: string,
  enabled: boolean
): Promise<{ success: boolean; error: string | null }> {
  try {
    const key = `notification_pref_${hostId}_${followerId}`;
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/kv/${key}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to set preference:', errorData);
      return { success: false, error: 'Failed to save preference' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error setting follower notification preference:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all followers with notification preferences
 * @param hostId - The ID of the host/user
 * @param followerIds - Array of follower IDs
 * @returns Map of follower ID to notification enabled status
 */
export async function getFollowerNotificationPreferences(
  hostId: string,
  followerIds: string[]
): Promise<{ preferences: Record<string, boolean>; error: string | null }> {
  try {
    if (followerIds.length === 0) {
      return { preferences: {}, error: null };
    }
    
    const keys = followerIds.map(followerId => `notification_pref_${hostId}_${followerId}`);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/kv/batch`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keys }),
      }
    );
    
    if (!response.ok) {
      console.error('Failed to load preferences');
      // Return all enabled as default
      const defaultPrefs: Record<string, boolean> = {};
      followerIds.forEach(id => { defaultPrefs[id] = true; });
      return { preferences: defaultPrefs, error: null };
    }
    
    const data = await response.json();
    const preferences: Record<string, boolean> = {};
    
    followerIds.forEach((followerId, index) => {
      const prefData = data.values?.[index];
      preferences[followerId] = prefData?.enabled ?? true;
    });
    
    return { preferences, error: null };
  } catch (error) {
    console.error('Error getting follower notification preferences:', error);
    // Return all enabled as default
    const defaultPrefs: Record<string, boolean> = {};
    followerIds.forEach(id => { defaultPrefs[id] = true; });
    return { preferences: defaultPrefs, error: null };
  }
}

/**
 * Get only followers who have notifications enabled
 * @param hostId - The ID of the host/user
 * @param followerIds - Array of all follower IDs
 * @returns Array of follower IDs who should receive notifications
 */
export async function getNotifiableFollowers(
  hostId: string,
  followerIds: string[]
): Promise<{ followerIds: string[]; error: string | null }> {
  try {
    const { preferences, error } = await getFollowerNotificationPreferences(hostId, followerIds);
    
    if (error) {
      // If there's an error, default to notifying all followers
      return { followerIds, error };
    }
    
    const notifiableFollowers = followerIds.filter(followerId => preferences[followerId] !== false);
    
    return { followerIds: notifiableFollowers, error: null };
  } catch (error) {
    console.error('Error getting notifiable followers:', error);
    // If there's an error, default to notifying all followers
    return { followerIds, error: 'An unexpected error occurred' };
  }
}
