import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  followUser as followUserDB,
  unfollowUser as unfollowUserDB,
  getFollowing as getFollowingDB,
  getFollowers as getFollowersDB,
  getFollowStatus as getFollowStatusDB,
  acceptFollowRequest as acceptFollowRequestDB,
  rejectFollowRequest as rejectFollowRequestDB,
  getPendingFollowRequests as getPendingFollowRequestsDB,
} from '../../lib/supabaseFollows';
import {
  getNotifications as getNotificationsDB,
  getUnreadCount as getUnreadCountDB,
  markAsRead as markAsReadDB,
  markAllAsRead as markAllAsReadDB,
  clearAllNotifications as clearAllNotificationsDB,
  subscribeToNotifications,
  type Notification as DBNotification,
} from '../../lib/supabaseNotifications';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'new_event' | 'follow';
  fromUserId: string;
  fromUserName: string;
  fromUserEmail?: string; // Keep for backward compatibility
  eventId?: string;
  eventTitle?: string;
  message: string;
  timestamp: Date;
  read: boolean;
  isOrganization?: boolean;
}

interface FollowContextType {
  following: string[]; // Array of user IDs you're following (accepted)
  followers: string[]; // Array of user IDs following you (accepted)
  notifications: Notification[];
  unreadCount: number;
  isLoadingFollows: boolean;
  isLoadingNotifications: boolean;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  cancelFollowRequest: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  getFollowStatus: (userId: string) => Promise<'none' | 'pending' | 'accepted'>;
  acceptFollowRequest: (followerId: string) => Promise<void>;
  rejectFollowRequest: (followerId: string) => Promise<void>;
  removeFollower: (followerId: string) => Promise<void>;
  getPendingRequests: () => Promise<Array<{ id: string; name: string; email: string; avatar?: string }>>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshFollows: () => Promise<void>;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingFollows, setIsLoadingFollows] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Load following/followers from Supabase
  useEffect(() => {
    async function loadFollows() {
      if (!user) {
        setFollowing([]);
        setFollowers([]);
        return;
      }
      
      setIsLoadingFollows(true);
      
      const [followingResult, followersResult] = await Promise.all([
        getFollowingDB(user.id),
        getFollowersDB(user.id),
      ]);
      
      if (followingResult.error) {
        console.error('Error loading following:', followingResult.error);
      } else {
        setFollowing(followingResult.following);
      }
      
      if (followersResult.error) {
        console.error('Error loading followers:', followersResult.error);
      } else {
        setFollowers(followersResult.followers);
      }
      
      setIsLoadingFollows(false);
    }
    
    loadFollows();
  }, [user]);

  // Load notifications from Supabase
  useEffect(() => {
    async function loadNotifications() {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      setIsLoadingNotifications(true);
      
      const [notificationsResult, countResult] = await Promise.all([
        getNotificationsDB(user.id),
        getUnreadCountDB(user.id),
      ]);
      
      if (notificationsResult.error) {
        console.error('Error loading notifications:', notificationsResult.error);
      } else {
        // Transform DB notifications to context format
        const transformedNotifs = notificationsResult.notifications.map(n => ({
          id: n.id,
          type: n.type,
          fromUserId: n.fromUserId,
          fromUserName: n.fromUserName,
          fromUserEmail: n.fromUserId, // Use ID as email for backward compatibility
          eventId: n.eventId,
          eventTitle: n.eventTitle,
          message: n.message,
          timestamp: new Date(n.createdAt),
          read: n.read,
          isOrganization: n.isOrganization,
        }));
        setNotifications(transformedNotifs);
      }
      
      if (countResult.error) {
        console.error('Error loading unread count:', countResult.error);
      } else {
        setUnreadCount(countResult.count);
      }
      
      setIsLoadingNotifications(false);
    }
    
    loadNotifications();
  }, [user]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToNotifications(user.id, (notification: DBNotification) => {
      // Add new notification to the list
      const newNotif: Notification = {
        id: notification.id,
        type: notification.type,
        fromUserId: notification.fromUserId,
        fromUserName: notification.fromUserName,
        fromUserEmail: notification.fromUserId,
        eventId: notification.eventId,
        eventTitle: notification.eventTitle,
        message: notification.message,
        timestamp: new Date(notification.createdAt),
        read: notification.read,
        isOrganization: notification.isOrganization,
      };
      
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.info(notification.message, {
        duration: 5000,
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, [user]);

  const followUser = async (userId: string) => {
    if (!user || userId === user.id) return;
    
    const { success, error } = await followUserDB(user.id, userId);
    
    if (error) {
      if (!error.includes('Already following')) {
        toast.error(error);
      }
      return;
    }
    
    if (success) {
      // Don't add to following array yet - it's still pending
      toast.success('Follow request sent! You\'ll be notified when approved.');
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;
    
    const { success, error } = await unfollowUserDB(user.id, userId);
    
    if (error) {
      toast.error(error);
      return;
    }
    
    if (success) {
      setFollowing(prev => prev.filter(id => id !== userId));
      toast.success('Unfollowed user');
    }
  };

  const cancelFollowRequest = async (userId: string) => {
    if (!user) return;
    
    const { success, error } = await unfollowUserDB(user.id, userId);
    
    if (error) {
      toast.error(error);
      return;
    }
    
    if (success) {
      setFollowing(prev => prev.filter(id => id !== userId));
      toast.success('Follow request cancelled');
    }
  };

  const isFollowing = (userId: string) => {
    return following.includes(userId);
  };

  const getFollowStatus = async (userId: string) => {
    if (!user) return 'none';
    
    const { status, error } = await getFollowStatusDB(user.id, userId);
    
    if (error) {
      // Don't show toast for follow status check errors - they're not critical
      console.error('Error checking follow status:', error);
      return 'none';
    }
    
    return status || 'none';
  };

  const acceptFollowRequest = async (followerId: string) => {
    if (!user) return;
    
    console.log('🎯 [FollowContext] Accepting follow request from:', followerId);
    
    const { success, error } = await acceptFollowRequestDB(followerId, user.id);
    
    if (error) {
      toast.error(error);
      return;
    }
    
    if (success) {
      setFollowers(prev => [...prev, followerId]);
      toast.success('Follow request accepted');
      await refreshFollows();
      
      // Trigger a custom event to notify other components
      // The followerId person is now following the current user (host)
      // So we dispatch with the host's ID so EventCards can update
      window.dispatchEvent(new CustomEvent('follow-status-changed', { detail: { userId: user.id } }));
    }
  };

  const rejectFollowRequest = async (followerId: string) => {
    if (!user) return;
    
    console.log('❌ [FollowContext] Rejecting follow request from:', followerId);
    
    const { success, error} = await rejectFollowRequestDB(followerId, user.id);
    
    if (error) {
      toast.error(error);
      return;
    }
    
    if (success) {
      toast.success('Follow request rejected');
      await refreshFollows();
      
      // Trigger a custom event to notify other components
      // The followerId person is no longer following the current user (host)
      // So we dispatch with the host's ID so EventCards can update
      window.dispatchEvent(new CustomEvent('follow-status-changed', { detail: { userId: user.id } }));
    }
  };

  const removeFollower = async (followerId: string) => {
    if (!user) return;
    
    console.log('🗑️ [FollowContext] Removing follower:', followerId);
    
    const { success, error} = await unfollowUserDB(followerId, user.id);
    
    if (error) {
      toast.error(error);
      return;
    }
    
    if (success) {
      setFollowers(prev => prev.filter(id => id !== followerId));
      toast.success('Follower removed');
      await refreshFollows();
      
      // Trigger a custom event to notify other components
      // The followerId person is no longer following the current user (host)
      // So we dispatch with the host's ID so EventCards can update
      window.dispatchEvent(new CustomEvent('follow-status-changed', { detail: { userId: user.id } }));
    }
  };

  const getPendingRequests = async () => {
    if (!user) return [];
    
    const { requests, error } = await getPendingFollowRequestsDB(user.id);
    
    if (error) {
      console.error('Error loading pending requests:', error);
      return [];
    }
    
    return requests || [];
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // This is kept for backward compatibility but won't be used much
    // Notifications are now created in the database directly
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    const { success, error } = await markAsReadDB(notificationId);
    
    if (error) {
      console.error('Error marking as read:', error);
      return;
    }
    
    if (success) {
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    const { success, error } = await markAllAsReadDB(user.id);
    
    if (error) {
      toast.error(error);
      return;
    }
    
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    }
  };

  const clearNotifications = async () => {
    if (!user) return;
    
    const { success, error } = await clearAllNotificationsDB(user.id);
    
    if (error) {
      toast.error(error);
      return;
    }
    
    if (success) {
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Notifications cleared');
    }
  };

  const refreshNotifications = async () => {
    if (!user) return;
    
    const [notificationsResult, countResult] = await Promise.all([
      getNotificationsDB(user.id),
      getUnreadCountDB(user.id),
    ]);
    
    if (!notificationsResult.error) {
      const transformedNotifs = notificationsResult.notifications.map(n => ({
        id: n.id,
        type: n.type,
        fromUserId: n.fromUserId,
        fromUserName: n.fromUserName,
        fromUserEmail: n.fromUserId,
        eventId: n.eventId,
        eventTitle: n.eventTitle,
        message: n.message,
        timestamp: new Date(n.createdAt),
        read: n.read,
        isOrganization: n.isOrganization,
      }));
      setNotifications(transformedNotifs);
    }
    
    if (!countResult.error) {
      setUnreadCount(countResult.count);
    }
  };

  const refreshFollows = async () => {
    if (!user) return;
    
    const [followingResult, followersResult] = await Promise.all([
      getFollowingDB(user.id),
      getFollowersDB(user.id),
    ]);
    
    if (!followingResult.error) {
      setFollowing(followingResult.following);
    }
    
    if (!followersResult.error) {
      setFollowers(followersResult.followers);
    }
  };

  return (
    <FollowContext.Provider value={{
      following,
      followers,
      notifications,
      unreadCount,
      isLoadingFollows,
      isLoadingNotifications,
      followUser,
      unfollowUser,
      cancelFollowRequest,
      isFollowing,
      getFollowStatus,
      acceptFollowRequest,
      rejectFollowRequest,
      removeFollower,
      getPendingRequests,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      refreshNotifications,
      refreshFollows,
    }}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
}