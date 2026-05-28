import { supabase } from './supabase';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ============================================
// FOLLOW MANAGEMENT
// ============================================

export interface Follow {
  followerId: string;
  followingId: string;
  status: 'pending' | 'accepted';
  createdAt: string;
}

export async function followUser(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Check if already following or requested
    const { data: existing } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    
    if (existing) {
      return { success: false, error: 'Already following or requested this user' };
    }
    
    // Create follow request with pending status
    const { error: followError } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
        status: 'pending',
      });
    
    if (followError) {
      console.error('Follow error:', followError);
      return { success: false, error: 'Failed to send follow request' };
    }
    
    // Get follower info for notification
    const { data: followerData } = await supabase
      .from('users')
      .select('name, is_organization')
      .eq('id', followerId)
      .single();
    
    // Create notification for the user being followed
    if (followerData) {
      await supabase.from('notifications').insert({
        user_id: followingId,
        type: 'follow_request',
        from_user_id: followerId,
        message: `${followerData.name} wants to follow you`,
        read: false,
      });
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error following user:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error: unfollowError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    
    if (unfollowError) {
      console.error('Unfollow error:', unfollowError);
      return { success: false, error: 'Failed to unfollow user' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error unfollowing user:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getFollowing(
  userId: string
): Promise<{ following: string[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
      .eq('status', 'accepted'); // Only return accepted follows
    
    if (error) {
      console.error('Get following error:', error);
      return { following: [], error: 'Failed to load following list' };
    }
    
    const following = data?.map(f => f.following_id) || [];
    return { following, error: null };
  } catch (error) {
    console.error('Unexpected error getting following:', error);
    return { following: [], error: 'An unexpected error occurred' };
  }
}

export async function getFollowers(
  userId: string
): Promise<{ followers: string[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId)
      .eq('status', 'accepted'); // Only return accepted followers
    
    if (error) {
      console.error('Get followers error:', error);
      return { followers: [], error: 'Failed to load followers list' };
    }
    
    const followers = data?.map(f => f.follower_id) || [];
    return { followers, error: null };
  } catch (error) {
    console.error('Unexpected error getting followers:', error);
    return { followers: [], error: 'An unexpected error occurred' };
  }
}

export async function getFollowStatus(
  followerId: string,
  followingId: string
): Promise<{ status: 'none' | 'pending' | 'accepted'; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('status')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Get follow status error:', error);
      return { status: 'none', error: 'Failed to check follow status' };
    }
    
    return { status: data?.status || 'none', error: null };
  } catch (error) {
    console.error('Unexpected error checking follow status:', error);
    return { status: 'none', error: 'An unexpected error occurred' };
  }
}

export async function getFollowCounts(
  userId: string
): Promise<{ followingCount: number; followersCount: number; error: string | null }> {
  try {
    // Get following count
    const { count: followingCount, error: followingError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)
      .eq('status', 'accepted'); // Only count accepted follows
    
    // Get followers count
    const { count: followersCount, error: followersError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
      .eq('status', 'accepted'); // Only count accepted followers
    
    if (followingError || followersError) {
      console.error('Get counts error:', followingError || followersError);
      return { followingCount: 0, followersCount: 0, error: 'Failed to load counts' };
    }
    
    return {
      followingCount: followingCount || 0,
      followersCount: followersCount || 0,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error getting counts:', error);
    return { followingCount: 0, followersCount: 0, error: 'An unexpected error occurred' };
  }
}

// Accept a follow request
export async function acceptFollowRequest(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('🎯 [Client->Server] Accepting follow request:', { followerId, followingId });
    
    // Call server-side function with elevated permissions
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-026f502c/follows/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ followerId, followingId }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ [Client] Server error accepting follow request:', result);
      return { success: false, error: result.error || 'Failed to accept follow request' };
    }
    
    console.log('✅ [Client] Follow request accepted via server');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ [Client] Unexpected error accepting follow request:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Reject a follow request
export async function rejectFollowRequest(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('❌ [Client->Server] Rejecting follow request:', { followerId, followingId });
    
    // Call server-side function with elevated permissions
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-026f502c/follows/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ followerId, followingId }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ [Client] Server error rejecting follow request:', result);
      return { success: false, error: result.error || 'Failed to reject follow request' };
    }
    
    console.log('✅ [Client] Follow request rejected via server');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ [Client] Unexpected error rejecting follow request:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get pending follow requests (people who want to follow you)
export async function getPendingFollowRequests(
  userId: string
): Promise<{ requests: Array<{ id: string; name: string; email: string; avatar?: string }>; error: string | null }> {
  try {
    console.log('📋 [DB] Fetching pending follow requests for userId:', userId);
    
    // First, get all pending follow requests
    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('follower_id, created_at')
      .eq('following_id', userId)
      .eq('status', 'pending');
    
    if (followError) {
      console.error('❌ [DB] Get pending follow requests error:', followError);
      return { requests: [], error: 'Failed to load pending requests' };
    }
    
    if (!followData || followData.length === 0) {
      console.log('✅ [DB] No pending follow requests found');
      return { requests: [], error: null };
    }
    
    console.log(`✅ [DB] Found ${followData.length} pending follow requests`);
    
    // Get user data for each follower
    const followerIds = followData.map(f => f.follower_id);
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', followerIds);
    
    if (usersError) {
      console.error('❌ [DB] Error fetching user data for followers:', usersError);
      return { requests: [], error: 'Failed to load follower data' };
    }
    
    console.log(`✅ [DB] Fetched user data for ${usersData?.length || 0} followers`);
    
    const requests = followData.map((follow: any) => {
      const user = usersData?.find(u => u.id === follow.follower_id);
      return {
        id: follow.follower_id,
        name: user?.name || 'Unknown User',
        email: user?.email || '',
        avatar: undefined, // Avatar can be fetched separately if needed
      };
    });
    
    console.log('✅ [DB] Returning pending follow requests:', requests);
    
    return { requests, error: null };
  } catch (error) {
    console.error('❌ [DB] Unexpected error getting pending requests:', error);
    return { requests: [], error: 'An unexpected error occurred' };
  }
}

// Get follower details (users who are following you with accepted status)
export async function getFollowerDetails(
  userId: string
): Promise<{ followers: Array<{ id: string; name: string; email: string }>; error: string | null }> {
  try {
    console.log('📋 [DB] Fetching follower details for userId:', userId);
    
    // First, get all accepted followers
    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId)
      .eq('status', 'accepted');
    
    if (followError) {
      console.error('❌ [DB] Get followers error:', followError);
      return { followers: [], error: 'Failed to load followers' };
    }
    
    if (!followData || followData.length === 0) {
      console.log('✅ [DB] No followers found');
      return { followers: [], error: null };
    }
    
    console.log(`✅ [DB] Found ${followData.length} followers`);
    
    // Get user data for each follower
    const followerIds = followData.map(f => f.follower_id);
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', followerIds);
    
    if (usersError) {
      console.error('❌ [DB] Error fetching user data for followers:', usersError);
      return { followers: [], error: 'Failed to load follower data' };
    }
    
    console.log(`✅ [DB] Fetched user data for ${usersData?.length || 0} followers`);
    
    const followers = usersData?.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
    })) || [];
    
    console.log('✅ [DB] Returning follower details:', followers);
    
    return { followers, error: null };
  } catch (error) {
    console.error('❌ [DB] Unexpected error getting follower details:', error);
    return { followers: [], error: 'An unexpected error occurred' };
  }
}