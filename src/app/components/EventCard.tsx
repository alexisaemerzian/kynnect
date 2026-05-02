import { useState, useEffect } from 'react';
import { Event } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Users, Clock, TrendingUp, Building2, UserPlus, UserCheck, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { differenceInMinutes, differenceInHours, format, isToday } from 'date-fns';
import { openInMaps } from '../utils/maps';
import { useAdminData } from '../context/AdminDataContext';
import { useEthnicity } from '../context/EthnicityContext';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';
import { toast } from 'sonner';

interface EventCardProps {
  event: Event;
  showTimeCountdown?: boolean;
}

export function EventCard({ event, showTimeCountdown }: EventCardProps) {
  const navigate = useNavigate();
  const { getApprovedPromotedEventIds } = useAdminData();
  const { selectedEthnicity } = useEthnicity();
  const { user } = useAuth();
  const { isFollowing, followUser, cancelFollowRequest, getFollowStatus } = useFollow();
  const [followStatus, setFollowStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  
  console.log('📝 EventCard event ID:', event.id, 'type:', typeof event.id);
  
  const promotedEventIds = getApprovedPromotedEventIds(selectedEthnicity?.id || '');
  const isPromoted = promotedEventIds.includes(event.id);
  const isOwnEvent = user?.id === event.host?.id;
  const following = isFollowing(event.host?.id || '');
  
  // Load follow status for this host
  useEffect(() => {
    async function loadFollowStatus() {
      if (!event.host?.id || isOwnEvent) return;
      const status = await getFollowStatus(event.host.id);
      setFollowStatus(status);
    }
    loadFollowStatus();
    
    // Listen for follow status changes
    const handleFollowStatusChange = (e: CustomEvent) => {
      if (e.detail.userId === event.host?.id) {
        console.log('🔄 Follow status changed for host:', event.host?.id);
        loadFollowStatus();
      }
    };
    
    window.addEventListener('follow-status-changed', handleFollowStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('follow-status-changed', handleFollowStatusChange as EventListener);
    };
  }, [event.host?.id, isOwnEvent, getFollowStatus]);
  
  // Check if current user is accepted to this event
  const userRsvp = event.rsvps?.find(rsvp => rsvp.userId === user?.id);
  const isAccepted = userRsvp?.status === 'accepted';
  const canSeeAddress = isOwnEvent || isAccepted;
  
  // Parse date properly - extract date part from ISO string
  const dateOnly = event.date.split('T')[0]; // Get "2026-03-27" from "2026-03-27T00:00:00+00:00"
  const eventDateTime = event.time 
    ? new Date(dateOnly + 'T' + event.time)
    : new Date(dateOnly);
  const now = new Date();
  const minutesUntil = differenceInMinutes(eventDateTime, now);
  const hoursUntil = differenceInHours(eventDateTime, now);
  
  const getTimeDisplay = () => {
    if (!showTimeCountdown) {
      return format(eventDateTime, 'MMM d, h:mm a');
    }
    
    if (minutesUntil < 0) {
      return 'Happening now';
    } else if (minutesUntil < 30) {
      return `In ${minutesUntil} min`;
    } else if (hoursUntil < 1) {
      return 'Starting soon';
    } else if (hoursUntil < 24 && isToday(eventDateTime)) {
      return `Today at ${format(eventDateTime, 'h:mm a')}`;
    } else {
      return format(eventDateTime, 'MMM d, h:mm a');
    }
  };
  
  const isHappeningNow = minutesUntil < 0 || (minutesUntil >= 0 && minutesUntil < 30);
  
  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!event.host?.id || !event.host?.name) {
      toast.error('Cannot follow this host');
      return;
    }
    
    if (followStatus === 'pending') {
      // Cancel pending request
      await cancelFollowRequest(event.host.id);
      setFollowStatus('none');
    } else if (followStatus === 'accepted') {
      // Unfollow
      await cancelFollowRequest(event.host.id);
      setFollowStatus('none');
    } else {
      // Send follow request
      await followUser(event.host.id);
      setFollowStatus('pending');
      toast.success(`Follow request sent to ${event.host.name}`);
    }
  };
  
  return (
    <div 
      onClick={() => {
        console.log('🎯 [EventCard] Clicked event:', event.id, event.title);
        console.log('🎯 [EventCard] Full event object:', event);
        navigate(`/event?id=${event.id}`);
      }}
      className="bg-white rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-semibold text-lg mb-1 truncate">{event.title}</h3>
            <div className="flex items-center gap-2 text-sm mb-2">
              {isHappeningNow && showTimeCountdown ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  {getTimeDisplay()}
                </Badge>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeDisplay()}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {canSeeAddress ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openInMaps(event);
                  }}
                  className="truncate hover:underline hover:text-blue-600 transition-colors text-left"
                >
                  {event.location}
                </button>
              ) : (
                <span className="text-gray-400 text-sm italic">
                  {event.city || 'Location'} • Address shared after approval
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <img 
              src={event.imageUrl} 
              alt={event.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>
        </div>
        
        {/* Who's Going */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {event.attendeesList && event.attendeesList.length > 0 ? (
              <div className="flex -space-x-2">
                {event.attendeesList.slice(0, 3).map((attendee, idx) => (
                  <Avatar key={attendee.id} className="h-7 w-7 border-2 border-white">
                    <AvatarImage src={attendee.avatar} />
                    <AvatarFallback className="text-xs">{attendee.name?.[0] || 'A'}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ) : (
              <Users className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-600">
              {event.attendees} {event.attendees === 1 ? 'person' : 'people'} going
            </span>
          </div>
          
          <Badge 
            variant="outline"
            className={event.type === 'curated' ? 'border-purple-300 text-purple-700' : 'border-orange-300 text-orange-700'}
          >
            {event.type === 'curated' ? '🗓️' : '⚡'}
          </Badge>
        </div>
        
        {/* Promoted Badge */}
        {isPromoted && (
          <div className="mt-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              <TrendingUp className="w-4 h-4 mr-1" />
              Promoted
            </Badge>
          </div>
        )}
        
        {/* Organization Badge */}
        {event.host?.isOrganization && event.host?.organizationName && (
          <div className="mt-2">
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
              <Building2 className="w-4 h-4 mr-1" />
              {event.host.organizationName}
            </Badge>
          </div>
        )}
        
        {/* RSVP Status Badges */}
        {!isOwnEvent && userRsvp && (
          <div className="mt-2">
            {userRsvp.status === 'pending' && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                <Clock className="w-3 h-3 mr-1" />
                Requested - Awaiting Approval
              </Badge>
            )}
            {userRsvp.status === 'accepted' && (
              <Badge className="bg-green-600 text-white">
                <Check className="w-3 h-3 mr-1" />
                Approved! Address Unlocked
              </Badge>
            )}
          </div>
        )}
        
        {/* Hosting Badge - show when user is the host */}
        {isOwnEvent && (
          <div className="mt-2">
            <Badge className="bg-purple-600 text-white">
              <Users className="w-3 h-3 mr-1" />
              You're Hosting
            </Badge>
          </div>
        )}
        
        {/* Follow Button */}
        {!isOwnEvent && (
          <div className="mt-3">
            <Button
              onClick={handleFollowToggle}
              size="sm"
              variant="outline"
              className={followStatus === 'accepted'
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white' 
                : followStatus === 'pending'
                ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50 bg-yellow-50/30'
                : 'border-green-300 text-green-700 hover:bg-green-50 bg-white'}
            >
              {followStatus === 'accepted' ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  Following
                </>
              ) : followStatus === 'pending' ? (
                <>
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Requested - Awaiting Approval
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  Follow for updates
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}