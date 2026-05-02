import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';
import { useEthnicity } from '../context/EthnicityContext';
import { getEthnicityData, getCurrentUser } from '../data/getEthnicityData';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Settings, MapPin, Mail, Phone, Calendar, Users, Clock, X, Check, Share2, UserPlus, UserMinus, Bell, BellOff, Building2, TrendingUp, DollarSign } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { NativeAd as BannerAd } from '../components/NativeAd';
import { UserProfileModal } from '../components/UserProfileModal';
import { getFollowerNotificationPreference, setFollowerNotificationPreference } from '../../lib/supabaseFollowerPreferences';
import { getEventsByEthnicity, Event, updateRSVPStatus } from '../../lib/supabaseEvents';
import { getFollowerDetails } from '../../lib/supabaseFollows';
import { getEventPromotions, type EventPromotion } from '../../lib/supabaseAdmin';
import { toast } from 'sonner';

export function ProfilePage() {
  const navigate = useNavigate();
  const { selectedEthnicity } = useEthnicity();
  const { user, userId } = useAuth();
  const { getPendingRequests, acceptFollowRequest, rejectFollowRequest, removeFollower, followers } = useFollow();
  const ethnicityData = getEthnicityData(selectedEthnicity?.id || 'armenian');
  const mockUser = getCurrentUser(selectedEthnicity?.id || 'armenian');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserEventId, setSelectedUserEventId] = useState<string | null>(null);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [pendingFollowRequests, setPendingFollowRequests] = useState<Array<{ id: string; name: string; email: string; avatar?: string }>>([]);
  const [followersList, setFollowersList] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [followerNotificationPrefs, setFollowerNotificationPrefs] = useState<Record<string, boolean>>({});
  const [promotionRequests, setPromotionRequests] = useState<EventPromotion[]>([]);
  
  // Load events from database
  useEffect(() => {
    async function loadEvents() {
      if (!selectedEthnicity) return;
      
      console.log('🔄 Loading events for profile page...');
      setIsLoadingEvents(true);
      const { events: loadedEvents, error } = await getEventsByEthnicity(selectedEthnicity.id);
      
      if (error) {
        console.error('❌ Error loading events:', error);
        toast.error('Failed to load events');
      } else {
        console.log('✅ Events loaded:', loadedEvents.length);
        setEvents(loadedEvents);
      }
      
      setIsLoadingEvents(false);
    }
    
    loadEvents();
  }, [selectedEthnicity]);
  
  // Get events hosted by this user (using user ID to match)
  const hostedEvents = events.filter(event => event.host.id === user?.id);
  
  console.log('👤 Profile Page Debug:');
  console.log('- User ID:', user?.id);
  console.log('- User email:', user?.email);
  console.log('- Total events:', events.length);
  console.log('- Hosted events:', hostedEvents.length);
  console.log('- Events:', events.map(e => ({ title: e.title, hostId: e.host.id, currentUserId: user?.id })));
  
  // Get events user is attending (where they have an accepted RSVP)
  const attendingEvents = events.filter(event =>
    event.rsvps?.some(rsvp => rsvp.userId === user?.id && rsvp.status === 'accepted')
  );

  // Helper function to check if an event is in the past
  const isEventPast = (event: Event) => {
    try {
      let eventDateTime: Date;

      if (event.time) {
        // Old format: separate date and time fields
        const dateOnly = event.date.split('T')[0];
        eventDateTime = new Date(dateOnly + 'T' + event.time);
      } else {
        // New format: parse the date string
        eventDateTime = new Date(event.date);
      }

      // Add 4 hours to event time to consider it "ended"
      const eventEndTime = new Date(eventDateTime.getTime() + 4 * 60 * 60 * 1000);
      return eventEndTime < new Date();
    } catch (error) {
      console.error('Error parsing event date:', error);
      return false;
    }
  };

  // Separate upcoming and past events
  const upcomingAttendingEvents = attendingEvents.filter(event => !isEventPast(event));
  const pastAttendingEvents = attendingEvents.filter(event => isEventPast(event));
  const upcomingHostedEvents = hostedEvents.filter(event => !isEventPast(event));
  const pastHostedEvents = hostedEvents.filter(event => isEventPast(event));

  console.log('- Attending events:', attendingEvents.length);
  console.log('- Upcoming attending:', upcomingAttendingEvents.length);
  console.log('- Past attending:', pastAttendingEvents.length);
  console.log('- Attending events details:', attendingEvents.map(e => ({ title: e.title, hostId: e.host.id })));
  
  // Get all pending RSVPs across all hosted events
  const allPendingRSVPs = hostedEvents.flatMap(event => 
    (event.rsvps || [])
      .filter(rsvp => rsvp.status === 'pending')
      .map(rsvp => ({ ...rsvp, eventId: event.id, eventTitle: event.title }))
  );
  
  const handleApproveRSVP = async (eventId: string, userId: string) => {
    if (!user?.id) return;
    
    console.log('🎯 Approving RSVP:', { eventId, userId, hostId: user.id });
    
    // Optimistically update UI immediately
    setEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.id !== eventId) return event;
        
        const updatedRsvps = event.rsvps?.map(rsvp =>
          rsvp.userId === userId
            ? { ...rsvp, status: 'accepted' as const }
            : rsvp
        ) || [];
        
        // Count accepted RSVPs + 1 for host
        const acceptedCount = updatedRsvps.filter(r => r.status === 'accepted').length + 1;
        
        return {
          ...event,
          rsvps: updatedRsvps,
          attendees: acceptedCount,
        };
      })
    );
    
    toast.success('RSVP approved!');
    
    // Update database in background
    const { success, error } = await updateRSVPStatus(eventId, userId, 'accepted', user.id);
    
    console.log('📊 Approve result:', { success, error });
    
    if (!success) {
      // If it fails, reload from server to get correct state
      toast.error(error || 'Failed to approve RSVP');
      const { events: loadedEvents } = await getEventsByEthnicity(selectedEthnicity!.id);
      if (loadedEvents) setEvents(loadedEvents);
    }
  };
  
  const handleDeclineRSVP = async (eventId: string, userId: string) => {
    if (!user?.id) return;
    
    console.log('❌ Declining RSVP:', { eventId, userId, hostId: user.id });
    
    // Optimistically update UI immediately - REMOVE the declined RSVP
    setEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.id !== eventId) return event;
        
        // Filter out the declined RSVP completely
        const updatedRsvps = event.rsvps?.filter(rsvp => rsvp.userId !== userId) || [];
        
        return {
          ...event,
          rsvps: updatedRsvps,
        };
      })
    );
    
    toast.success('RSVP declined');
    
    // Update database in background
    const { success, error } = await updateRSVPStatus(eventId, userId, 'declined', user.id);
    
    console.log('📊 Decline result:', { success, error });
    
    if (!success) {
      // If it fails, reload from server to get correct state
      toast.error(error || 'Failed to decline RSVP');
      const { events: loadedEvents } = await getEventsByEthnicity(selectedEthnicity!.id);
      if (loadedEvents) setEvents(loadedEvents);
    }
  };
  
  const handleShareApp = async () => {
    const shareUrl = window.location.origin;
    const shareText = `Join me on ${selectedEthnicity?.displayName}! Discover and connect with the ${selectedEthnicity?.name} community worldwide.`;
    
    // Try to use Web Share API (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedEthnicity?.displayName || 'Kynnect',
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
        return;
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name === 'AbortError') {
          // User cancelled, don't show error
          return;
        }
        console.error('Error sharing:', error);
        // Continue to clipboard fallback
      }
    }
    
    // Fallback to copying link to clipboard
    copyToClipboard(shareUrl);
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('App link copied to clipboard!');
        return;
      }
      
      // Fallback to older method using textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        toast.success('App link copied to clipboard!');
      } else {
        throw new Error('execCommand failed');
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      // Show the link in a dialog that user can manually copy
      toast.error('Could not copy automatically. Please copy this link: ' + text, {
        duration: 10000,
      });
    }
  };
  
  // Load pending follow requests
  useEffect(() => {
    async function loadPendingRequests() {
      if (!user) return;
      
      console.log('🔄 Loading pending follow requests...');
      const requests = await getPendingRequests();
      
      if (requests) {
        console.log('✅ Pending follow requests loaded:', requests.length);
        setPendingFollowRequests(requests);
      } else {
        console.log('⚠️ No pending follow requests');
      }
    }
    
    loadPendingRequests();
  }, [user]); // Removed getPendingRequests from dependencies to prevent continuous reloading
  
  const handleAcceptFollowRequest = async (followerId: string) => {
    console.log('🎯 Accepting follow request from:', followerId);
    
    try {
      // Update database FIRST before optimistic update
      await acceptFollowRequest(followerId);
      
      // Then remove from pending requests list
      setPendingFollowRequests(prev => prev.filter(r => r.id !== followerId));
      
      toast.success('Follow request approved!');
      
      // Reload followers list to include the new follower
      if (user) {
        const { followers: followersData } = await getFollowerDetails(user.id);
        if (followersData) {
          setFollowersList(followersData);
          
          // Load notification preferences for new followers
          const prefs: Record<string, boolean> = {};
          for (const follower of followersData) {
            const { enabled } = await getFollowerNotificationPreference(user.id, follower.id);
            prefs[follower.id] = enabled;
          }
          setFollowerNotificationPrefs(prefs);
        }
      }
      
      // Double-check by reloading pending requests to verify...
      console.log('🔄 Reloading pending requests to verify...');
      const requests = await getPendingRequests();
      setPendingFollowRequests(requests || []);
      
    } catch (error) {
      console.error('❌ Error accepting follow request:', error);
      toast.error('Failed to approve follow request');
      // Reload on error to get the correct state
      const requests = await getPendingRequests();
      setPendingFollowRequests(requests || []);
    }
  };
  
  const handleRejectFollowRequest = async (followerId: string) => {
    console.log('❌ Rejecting follow request from:', followerId);
    
    try {
      // Update database FIRST
      await rejectFollowRequest(followerId);
      
      // Then remove from pending requests list
      setPendingFollowRequests(prev => prev.filter(r => r.id !== followerId));
      
      toast.success('Follow request declined');
      
      // Double-check by reloading pending requests
      const requests = await getPendingRequests();
      setPendingFollowRequests(requests || []);
      
    } catch (error) {
      console.error('❌ Error rejecting follow request:', error);
      toast.error('Failed to decline follow request');
      // Reload on error to get the correct state
      const requests = await getPendingRequests();
      setPendingFollowRequests(requests || []);
    }
  };
  
  // Load followers list
  useEffect(() => {
    async function loadFollowers() {
      if (!user) return;

      console.log('🔄 Loading followers list...');
      const { followers: followersData, error } = await getFollowerDetails(user.id);

      if (error) {
        console.error('❌ Error loading followers:', error);
      } else {
        console.log('✅ Followers loaded:', followersData.length);
        setFollowersList(followersData);

        // Load notification preferences for all followers
        const prefs: Record<string, boolean> = {};
        for (const follower of followersData) {
          const { enabled } = await getFollowerNotificationPreference(user.id, follower.id);
          prefs[follower.id] = enabled;
        }
        setFollowerNotificationPrefs(prefs);
      }
    }

    loadFollowers();
  }, [user, followers]); // Refresh when followers changes

  // Load promotion requests
  useEffect(() => {
    async function loadPromotions() {
      if (!user) return;

      console.log('🔄 Loading promotion requests...');
      const { promotions, error } = await getEventPromotions({ userId: user.id });

      if (error) {
        console.error('❌ Error loading promotions:', error);
      } else {
        console.log('✅ Promotions loaded:', promotions.length);
        setPromotionRequests(promotions);
      }
    }

    loadPromotions();
  }, [user]);
  
  const handleRemoveFollower = async (followerId: string) => {
    if (!user) return;
    
    console.log('🗑️ Removing follower:', followerId);
    
    // Call removeFollower which removes the follow relationship
    await removeFollower(followerId);
    
    // Optimistically update UI
    setFollowersList(prevList => prevList.filter(f => f.id !== followerId));
  };
  
  const handleToggleNotifications = async (followerId: string) => {
    if (!user) return;
    
    const currentPref = followerNotificationPrefs[followerId] ?? true;
    const newPref = !currentPref;
    
    // Optimistic update
    setFollowerNotificationPrefs(prev => ({ ...prev, [followerId]: newPref }));
    
    const { success, error } = await setFollowerNotificationPreference(user.id, followerId, newPref);
    
    if (error) {
      // Revert on error
      setFollowerNotificationPrefs(prev => ({ ...prev, [followerId]: currentPref }));
      toast.error('Failed to update notification preference');
    } else {
      toast.success(newPref ? 'Notifications enabled for this follower' : 'Notifications disabled for this follower');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-xl font-semibold">Profile</h1>
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-white/20">
              <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} />
              <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">{user?.name || 'User'}</h2>
              <div className="flex items-center gap-1.5 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{user?.city || 'No city set'}</span>
              </div>
            </div>
          </div>
          
          {/* Edit Profile Button */}
          <Button
            variant="outline"
            className="w-full mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Bio */}
        {(user?.bio || mockUser.bio) && (
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <p className="text-gray-700">{user?.bio || mockUser.bio}</p>
            </CardContent>
          </Card>
        )}
        
        {/* Organization Info - Only show if user is an organization */}
        {user?.isOrganization && (
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold">Organization Details</h3>
              </div>
              <div className="space-y-3">
                {user.organizationName && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Name</p>
                    <p className="text-gray-900 font-medium">{user.organizationName}</p>
                  </div>
                )}
                {user.organizationType && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Type</p>
                    <p className="text-gray-900">{user.organizationType}</p>
                  </div>
                )}
                {user.organizationLocation && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Location</p>
                      <p className="text-gray-900">{user.organizationLocation}</p>
                    </div>
                  </div>
                )}
                {user.organizationWebsite && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Website</p>
                    <a 
                      href={user.organizationWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline break-all"
                    >
                      {user.organizationWebsite}
                    </a>
                  </div>
                )}
                {user.organizationDescription && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Description</p>
                    <p className="text-gray-700">{user.organizationDescription}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Contact Info - Only show if user data exists */}
        {user && (
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                </div>
              </div>
              
              {/* Notification Preferences */}
              {user.notificationCity && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-3 text-sm">Notification Preferences</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-600">City:</span>
                      <span className="font-medium text-gray-900">{user.notificationCity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-600">Email updates:</span>
                      <span className={user.emailNotifications ? 'text-green-600 font-medium' : 'text-gray-400'}>
                        {user.emailNotifications ? 'On' : 'Off'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-600">SMS updates:</span>
                      <span className={user.smsNotifications ? 'text-green-600 font-medium' : 'text-gray-400'}>
                        {user.smsNotifications ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-gray-200">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold mb-1">
                {hostedEvents.length}
              </div>
              <p className="text-sm text-gray-600">Events Hosted</p>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold mb-1">
                {attendingEvents.length}
              </div>
              <p className="text-sm text-gray-600">Events Attending</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Pending RSVP Approvals */}
        {allPendingRSVPs.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">Pending Approvals</h3>
                <Badge variant="outline" className="ml-auto bg-orange-100 text-orange-700 border-orange-300">
                  {allPendingRSVPs.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {allPendingRSVPs.map((rsvp) => (
                  <div key={`${rsvp.eventId}-${rsvp.userId}`} className="bg-white rounded-lg p-3 border border-orange-200">
                    <div 
                      className="flex items-start gap-3 mb-3 cursor-pointer hover:bg-gray-50 -m-3 p-3 rounded-t-lg transition-colors"
                      onClick={() => {
                        setSelectedUserId(rsvp.userId);
                        setSelectedUserEventId(rsvp.eventId);
                        setIsUserProfileOpen(true);
                      }}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={rsvp.userAvatar} />
                        <AvatarFallback>{rsvp.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{rsvp.userName}</p>
                        <p className="text-xs text-gray-600 truncate">wants to join: {rsvp.eventTitle}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeclineRSVP(rsvp.eventId, rsvp.userId);
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveRSVP(rsvp.eventId, rsvp.userId);
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Pending Follow Requests */}
        {pendingFollowRequests.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Pending Follow Requests</h3>
                <Badge variant="outline" className="ml-auto bg-blue-100 text-blue-700 border-blue-300">
                  {pendingFollowRequests.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {pendingFollowRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg p-3 border border-blue-200">
                    <div 
                      className="flex items-start gap-3 mb-3 cursor-pointer hover:bg-gray-50 -m-3 p-3 rounded-t-lg transition-colors"
                      onClick={() => {
                        setSelectedUserId(request.id);
                        setIsUserProfileOpen(true);
                      }}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.avatar} />
                        <AvatarFallback>{request.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{request.name}</p>
                        <p className="text-xs text-gray-600 truncate">wants to follow you</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectFollowRequest(request.id);
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptFollowRequest(request.id);
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Followers - People following you */}
        {followersList.length > 0 && (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Your Followers</h3>
                <Badge variant="outline" className="ml-auto bg-green-100 text-green-700 border-green-300">
                  {followersList.length}
                </Badge>
              </div>
              <p className="text-xs text-green-700 mb-4">Manage who gets notified when you host new events</p>
              
              <div className="space-y-3">
                {followersList.map((follower) => {
                  const notificationsEnabled = followerNotificationPrefs[follower.id] ?? true;
                  return (
                    <div key={follower.id} className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-gray-50 -m-3 p-3 rounded-lg transition-colors"
                          onClick={() => {
                            setSelectedUserId(follower.id);
                            setIsUserProfileOpen(true);
                          }}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${follower.name}`} />
                            <AvatarFallback>{follower.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{follower.name}</p>
                            <p className="text-xs text-gray-600 truncate">{follower.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className={notificationsEnabled 
                              ? 'border-green-300 text-green-700 hover:bg-green-50' 
                              : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleNotifications(follower.id);
                            }}
                            title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
                          >
                            {notificationsEnabled ? (
                              <Bell className="w-4 h-4" />
                            ) : (
                              <BellOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFollower(follower.id);
                            }}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Promotion Requests */}
        {promotionRequests.length > 0 && (
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Event Promotion Requests</h3>
                <Badge variant="outline" className="ml-auto bg-purple-100 text-purple-700 border-purple-300">
                  {promotionRequests.length}
                </Badge>
              </div>
              <p className="text-xs text-purple-700 mb-4">Track your event boost requests and payment status</p>

              <div className="space-y-3">
                {promotionRequests.map((promo) => {
                  const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                    approved: 'bg-green-100 text-green-800 border-green-300',
                    rejected: 'bg-red-100 text-red-800 border-red-300',
                  };

                  const packageNames = {
                    'basic': '3-Day Boost',
                    'standard': '7-Day Featured',
                    'premium': '14-Day Premium',
                  };

                  return (
                    <div key={promo.id} className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{promo.event?.title || 'Event'}</h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {packageNames[promo.package as keyof typeof packageNames] || promo.package}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={statusColors[promo.status]}>
                            {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>${promo.price}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(promo.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {promo.status === 'approved' && promo.startDate && promo.endDate && (
                        <div className="mt-2 pt-2 border-t border-purple-100">
                          <p className="text-xs text-green-700">
                            ✅ Active: {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {promo.status === 'rejected' && promo.rejectedReason && (
                        <div className="mt-2 pt-2 border-t border-purple-100">
                          <p className="text-xs text-red-700">❌ Reason: {promo.rejectedReason}</p>
                        </div>
                      )}

                      {promo.status === 'pending' && (
                        <div className="mt-2 pt-2 border-t border-purple-100">
                          <p className="text-xs text-yellow-700">⏳ Awaiting admin approval. Payment will be processed upon approval.</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events You're Attending */}
        {upcomingAttendingEvents.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">Upcoming Events You're Attending</h3>
            <div className="space-y-3">
              {upcomingAttendingEvents.map(event => (
                <Card
                  key={event.id}
                  className="cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all border-gray-200"
                  onClick={() => navigate(`/event?id=${event.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium truncate">{event.title}</h4>
                          <Badge
                            variant="outline"
                            className={event.type === 'curated' ? 'text-purple-600 border-purple-300 bg-purple-50' : 'text-orange-600 border-orange-300 bg-orange-50'}
                          >
                            {event.type === 'curated' ? '🗓️' : '⚡'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="truncate">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Users className="w-3.5 h-3.5" />
                            <span>{event.attendees} attending</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Upcoming Events You've Hosted */}
        {upcomingHostedEvents.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">Events You're Hosting</h3>
            <div className="space-y-3">
              {upcomingHostedEvents.map(event => {
                const pendingCount = event.rsvps?.filter(r => r.status === 'pending').length || 0;

                return (
                  <Card
                    key={event.id}
                    className="cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all border-gray-200"
                    onClick={() => navigate(`/event?id=${event.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium truncate">{event.title}</h4>
                            <Badge
                              variant="outline"
                              className={event.type === 'curated' ? 'text-purple-600 border-purple-300 bg-purple-50' : 'text-orange-600 border-orange-300 bg-orange-50'}
                            >
                              {event.type === 'curated' ? '🗓️' : '⚡'}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="truncate">{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Users className="w-3.5 h-3.5" />
                              <span>{event.attendees} attending</span>
                              {pendingCount > 0 && (
                                <Badge variant="outline" className="ml-1 bg-orange-100 text-orange-700 border-orange-300 text-xs">
                                  {pendingCount} pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Events Attended */}
        {pastAttendingEvents.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">Events Attended</h3>
            <div className="space-y-3">
              {pastAttendingEvents.map(event => (
                <Card
                  key={event.id}
                  className="cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all border-gray-200 opacity-75"
                  onClick={() => navigate(`/event?id=${event.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="relative">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                          <Badge className="bg-gray-900 text-white text-xs">Ended</Badge>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium truncate">{event.title}</h4>
                          <Badge
                            variant="outline"
                            className={event.type === 'curated' ? 'text-purple-600 border-purple-300 bg-purple-50' : 'text-orange-600 border-orange-300 bg-orange-50'}
                          >
                            {event.type === 'curated' ? '🗓️' : '⚡'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="truncate">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Users className="w-3.5 h-3.5" />
                            <span>{event.attendees} attended</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Events Hosted */}
        {pastHostedEvents.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">Past Events You've Hosted</h3>
            <div className="space-y-3">
              {pastHostedEvents.map(event => (
                <Card
                  key={event.id}
                  className="cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all border-gray-200 opacity-75"
                  onClick={() => navigate(`/event?id=${event.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="relative">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                          <Badge className="bg-gray-900 text-white text-xs">Ended</Badge>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium truncate">{event.title}</h4>
                          <Badge
                            variant="outline"
                            className={event.type === 'curated' ? 'text-purple-600 border-purple-300 bg-purple-50' : 'text-orange-600 border-orange-300 bg-orange-50'}
                          >
                            {event.type === 'curated' ? '🗓️' : '⚡'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="truncate">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Users className="w-3.5 h-3.5" />
                            <span>{event.attendees} attended</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Share App */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-black text-white rounded-lg">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Share {selectedEthnicity?.displayName}</h3>
                <p className="text-sm text-gray-700">
                  Invite others from the {selectedEthnicity?.name} community to join
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-gray-300 hover:bg-gray-200"
              onClick={handleShareApp}
            >
              Share App Link
            </Button>
          </CardContent>
        </Card>
        
        {/* Banner Ad */}
        <BannerAd />
      </div>
      
      <BottomNav />
      
      {/* User Profile Modal */}
      {selectedUserId && isUserProfileOpen && (
        <UserProfileModal
          isOpen={isUserProfileOpen}
          userId={selectedUserId}
          onClose={() => {
            setIsUserProfileOpen(false);
            setSelectedUserId(null);
            setSelectedUserEventId(null);
          }}
          showActions={true}
          onApprove={() => {
            if (selectedUserEventId) {
              handleApproveRSVP(selectedUserEventId, selectedUserId);
            }
          }}
          onDecline={() => {
            if (selectedUserEventId) {
              handleDeclineRSVP(selectedUserEventId, selectedUserId);
            }
          }}
        />
      )}
    </div>
  );
}