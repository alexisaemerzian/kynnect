import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { getEventById, createRSVP, deleteRSVP, updateRSVPStatus, addComment } from '../../lib/supabaseEvents';
import { getOrCreateConversation, sendMessage } from '../../lib/supabaseMessages';
import { Event } from '../types';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { MapPin, Calendar, Clock, Users, ArrowLeft, Share2, UserPlus, UserCheck, MessageCircle, Send, TrendingUp, AlertCircle, CalendarPlus, Edit } from 'lucide-react';
import { format, differenceInMinutes, differenceInHours, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useEthnicity } from '../context/EthnicityContext';
import { useFollow } from '../context/FollowContext';
import { toast } from 'sonner';
import { openInMaps } from '../utils/maps';
import { Textarea } from '../components/ui/textarea';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { PromoteEventDialog } from '../components/PromoteEventDialog';
import { NativeAd } from '../components/NativeAd';
import { AttendeesModal } from '../components/AttendeesModal';

export function EventDetailsPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedEthnicity } = useEthnicity();
  const { isFollowing, followUser, unfollowUser } = useFollow();
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRSVPing, setIsRSVPing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Load event from Supabase
  useEffect(() => {
    const loadEventDetails = async () => {
      console.log('🔍 [EVENT DETAILS] searchParams id:', id);
      console.log('🔍 [EVENT DETAILS] typeof id:', typeof id);
      console.log('🔍 [EVENT DETAILS] window.location:', window.location.href);
      console.log('🔍 [EVENT DETAILS] window.location.search:', window.location.search);
      
      if (!id) {
        console.error('❌ [EVENT DETAILS] No id from searchParams!');
        setError('Invalid event URL - missing id parameter');
        setIsLoading(false);
        return;
      }

      console.log('Loading event with ID:', id);

      try {
        setIsLoading(true);
        setError(null);

        const url = `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events/${id}`;
        console.log('Fetching from:', url);
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load event');
        }

        if (!data.event) {
          throw new Error('Event not found');
        }

        // Ensure comments array exists
        setEvent({
          ...data.event,
          comments: data.event.comments || [],
        });
        setRsvps(data.rsvps || []);
      } catch (err) {
        console.error('Error loading event:', err);
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    };

    loadEventDetails();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-2">Loading event...</p>
          <p className="text-sm text-gray-500">Event ID: {id}</p>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-lg font-semibold mb-4">Event not found</p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-xs mb-4">
            <p className="font-mono mb-2"><strong>Debug Info:</strong></p>
            <p className="font-mono">Event ID from URL: {id}</p>
            <p className="font-mono">ID Type: {typeof id}</p>
            <p className="font-mono">ID Length: {id?.length}</p>
          </div>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  // Handle both old format (date + time) and new format (combined date string)
  let eventDateTime: Date;
  let formattedDate: string;
  let formattedTime: string;
  
  if (event.time) {
    // Old format: separate date and time fields
    const dateOnly = event.date.split('T')[0]; // Extract date from ISO string
    eventDateTime = new Date(dateOnly + 'T' + event.time);
    formattedDate = format(eventDateTime, 'EEEE, MMMM d, yyyy');
    formattedTime = format(eventDateTime, 'h:mm a');
  } else {
    // New format: human-readable date string like "Tonight at 8:00 PM"
    // Just use the string as-is for display
    formattedDate = event.date;
    formattedTime = ''; // Time is already in the date string
    // Create a mock future date for calculations (tomorrow)
    eventDateTime = new Date();
    eventDateTime.setDate(eventDateTime.getDate() + 1);
  }
  
  const now = new Date();
  const minutesUntil = differenceInMinutes(eventDateTime, now);
  const hoursUntil = differenceInHours(eventDateTime, now);

  // Check if event is in the past (ended 4 hours after start time)
  const eventEndTime = new Date(eventDateTime.getTime() + 4 * 60 * 60 * 1000);
  const isEventEnded = eventEndTime < now;

  // Check current user's RSVP status
  const currentUserRSVP = event.rsvps?.find(rsvp => rsvp.userId === user?.id);
  const isHost = event.host?.id === user?.id;
  const hasApprovedRSVP = currentUserRSVP?.status === 'accepted';
  
  const getTimeDisplay = () => {
    if (isEventEnded) {
      return 'Event Ended';
    } else if (minutesUntil < 0) {
      return 'Happening now';
    } else if (minutesUntil < 30) {
      return `Starting in ${minutesUntil} min`;
    } else if (hoursUntil < 1) {
      return 'Starting soon';
    } else if (hoursUntil < 24) {
      return `Starting in ${hoursUntil}h`;
    }
    return null;
  };
  
  const spotsLeft = event.maxAttendees ? event.maxAttendees - event.attendees : null;
  const timeDisplay = getTimeDisplay();
  
  const handleRSVP = async () => {
    if (!user) {
      toast.error('Please log in to RSVP');
      navigate('/login');
      return;
    }
    
    if (!event) return;
    
    setIsRSVPing(true);
    
    const { rsvp, error } = await createRSVP(event.id, user.id);
    
    if (error) {
      toast.error(error);
      setIsRSVPing(false);
    } else if (rsvp) {
      // Refetch the event data to get the latest RSVP state
      try {
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events/${event.id}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.event) {
            setEvent(data.event);
            setRsvps(data.rsvps || []);
          }
        }
      } catch (err) {
        console.error('Error refetching event:', err);
      }
      
      toast.success('Request sent! Waiting for host approval.');
      setIsRSVPing(false);
    }
  };
  
  const handleUnRSVP = async () => {
    if (!user) {
      toast.error('You must be logged in to cancel your RSVP');
      return;
    }
    
    if (!currentUserRSVP) {
      toast.info('You have not RSVPed to this event');
      return;
    }
    
    setIsRSVPing(true);
    
    const { error } = await deleteRSVP(event.id, user.id);
    
    if (error) {
      toast.error(error);
    } else {
      // Update local state
      setEvent({
        ...event,
        rsvps: event.rsvps?.filter(rsvp => rsvp.userId !== user.id) || [],
      });
      toast.success('RSVP canceled.');
    }
    
    setIsRSVPing(false);
  };
  
  const handleShare = () => {
    toast.success('Event link copied to clipboard');
  };
  
  const addToGoogleCalendar = () => {
    // Only works if we have a parseable date/time
    if (!event.time) {
      toast.info('Calendar export not available for this event format');
      return;
    }
    
    const dateOnly = event.date.split('T')[0]; // Extract date from ISO string
    const eventDateTime = new Date(dateOnly + 'T' + event.time);
    const endTime = new Date(eventDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hour duration

    // Format dates for Google Calendar (yyyyMMddTHHmmss format)
    const formatGoogleDate = (date: Date) => {
      return format(date, "yyyyMMdd'T'HHmmss");
    };

    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.append('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.append('text', event.title);
    googleCalendarUrl.searchParams.append('dates', `${formatGoogleDate(eventDateTime)}/${formatGoogleDate(endTime)}`);
    googleCalendarUrl.searchParams.append('details', event.description);
    // Only include exact location if user can see the address
    googleCalendarUrl.searchParams.append('location', showAddress ? event.location : event.city || 'Location TBD');

    window.open(googleCalendarUrl.toString(), '_blank');
    toast.success('Opening Google Calendar...');
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please log in to comment');
      navigate('/login');
      return;
    }
    
    if (!commentText.trim()) return;
    
    setIsPostingComment(true);
    
    const { comment, error } = await addComment(event.id, user.id, commentText);
    
    if (error) {
      toast.error(error);
    } else if (comment) {
      // Update local state
      setEvent({
        ...event,
        comments: [...(event.comments || []), comment],
      });
      setCommentText('');
      toast.success('Comment added!');
    }
    
    setIsPostingComment(false);
  };
  
  // Determine if address should be shown
  const isPublicEvent = event.addressVisibility === 'public';
  const showAddress = isHost || currentUserRSVP?.status === 'accepted' || isPublicEvent;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-64 w-full">
        <img 
          src={event.imageUrl} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-colors shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {isHost && !isEventEnded && (
          <button
            onClick={() => navigate(`/event/edit?id=${event.id}`)}
            className="absolute top-4 right-16 bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-colors shadow-lg"
          >
            <Edit className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-colors shadow-lg"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
      
      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <Badge 
            variant="outline"
            className={event.type === 'curated' ? 'border-purple-300 text-purple-700 bg-purple-50' : 'border-orange-300 text-orange-700 bg-orange-50'}
          >
            {event.type === 'curated' ? '🗓️ Curated' : '⚡ Spontaneous'}
          </Badge>
        </div>
        
        {timeDisplay && (
          <div className="mb-4">
            <Badge className={isEventEnded ? "bg-gray-600" : "bg-green-600"}>
              <Clock className="w-3 h-3 mr-1" />
              {timeDisplay}
            </Badge>
          </div>
        )}

        {/* Event Ended Banner */}
        {isEventEnded && (
          <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-semibold text-gray-900">This event has ended</p>
                <p className="text-sm text-gray-600">This event took place on {formattedDate}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* RSVP Status Badge */}
        {currentUserRSVP && (
          <div className="mb-4">
            {currentUserRSVP.status === 'pending' && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                <Clock className="w-3 h-3 mr-1" />
                Pending Host Approval
              </Badge>
            )}
            {currentUserRSVP.status === 'accepted' && (
              <Badge className="bg-green-600">
                ✓ You're approved!
              </Badge>
            )}
            {currentUserRSVP.status === 'declined' && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                Request Declined
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src={event.host?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.host?.name}`} />
            <AvatarFallback>{event.host?.name?.[0] || 'H'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-600">Hosted by</p>
            <p className="font-medium">{event.host?.name || 'Unknown Host'}</p>
          </div>
        </div>
        
        {/* Details */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-black mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{formattedDate}</p>
              <p className="text-sm text-gray-600">{formattedTime}</p>
            </div>
            <Button
              onClick={addToGoogleCalendar}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              Add to Calendar
            </Button>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-black mt-0.5" />
            <div className="flex-1">
              {showAddress ? (
                <>
                  <button
                    onClick={() => openInMaps(event)}
                    className="font-medium hover:text-blue-600 hover:underline transition-colors text-left"
                  >
                    {event.location}
                  </button>
                  <p className="text-sm text-gray-600">{event.city}</p>
                  <p className="text-xs text-blue-600 mt-1">Tap to open in maps </p>
                </>
              ) : (
                <div>
                  <p className="font-medium text-gray-400">Address Hidden</p>
                  <p className="text-sm text-gray-600">{event.city}</p>
                  <div className="mt-2 flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="w-4 h-4 text-yellow-700 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">
                      Join the event to receive the exact address once the host approves your request.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-black mt-0.5" />
            <div className="flex-1">
              {(isHost || currentUserRSVP?.status === 'accepted') ? (
                <button
                  onClick={() => setIsAttendeesModalOpen(true)}
                  className="text-left hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors w-full"
                >
                  <p className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                    {event.attendees} people attending
                  </p>
                  {spotsLeft !== null && (
                    <p className="text-sm text-gray-600">
                      {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Event is full'}
                    </p>
                  )}
                  <p className="text-xs text-blue-500 mt-1">Click to see who's going</p>
                </button>
              ) : (
                <div>
                  <p className="font-medium text-gray-900">
                    {event.attendees} people attending
                  </p>
                  {spotsLeft !== null && (
                    <p className="text-sm text-gray-600">
                      {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Event is full'}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Only the host and attending guests can see attendees</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 mb-6">
          <h2 className="font-semibold mb-3">About this event</h2>
          <p className="text-gray-700 leading-relaxed">{event.description}</p>
        </div>
        
        {/* Who's Going */}
        {(isHost || currentUserRSVP?.status === 'accepted') && event.attendeesList && event.attendeesList.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-gray-200 mb-6">
            <h2 className="font-semibold mb-4">Who's Going</h2>
            <div className="space-y-3">
              {event.attendeesList.map((attendee) => (
                <div key={attendee.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={attendee.avatar} />
                    <AvatarFallback>{attendee.name?.[0] || 'A'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{attendee.name}</p>
                    <p className="text-xs text-gray-600">{attendee.city}</p>
                  </div>
                </div>
              ))}
              {event.attendees > (event.attendeesList?.length || 0) && (
                <p className="text-sm text-gray-500">
                  +{event.attendees - event.attendeesList.length} more {event.attendees - event.attendeesList.length === 1 ? 'person' : 'people'}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {event.tags.map(tag => (
              <Badge key={tag} variant="outline" className="bg-gray-50">{tag}</Badge>
            ))}
          </div>
        )}
        
        {/* Message Host */}
        {!isHost && hasApprovedRSVP && (
          <div className="bg-white rounded-xl p-5 border border-gray-200 mb-6">
            <h2 className="font-semibold mb-4">Message Host</h2>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={event.host?.avatar} />
                <AvatarFallback>{event.host?.name?.[0] || 'H'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{event.host?.name}</p>
                <p className="text-xs text-gray-600">Host</p>
              </div>
            </div>
            <div className="mt-4">
              <Button
                onClick={() => setIsMessageOpen(true)}
                className="w-full bg-black hover:bg-gray-800"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        )}
        
        {/* Promote Event - Only for hosts and upcoming events */}
        {isHost && !isEventEnded && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold mb-1">Boost Your Event</h2>
                <p className="text-sm text-gray-700">
                  Get featured placement and reach up to 10x more people in your community
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsPromoteDialogOpen(true)}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Promote This Event
            </Button>
          </div>
        )}
        
        <PromoteEventDialog
          open={isPromoteDialogOpen}
          onOpenChange={setIsPromoteDialogOpen}
          eventId={event.id}
          eventTitle={event.title}
        />
        
        {/* Message Modal */}
        {isMessageOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="font-semibold mb-4">Message Host</h2>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={event.host?.avatar} />
                  <AvatarFallback>{event.host?.name?.[0] || 'H'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{event.host?.name}</p>
                  <p className="text-xs text-gray-600">Host</p>
                </div>
              </div>
              <div className="mt-4">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Type your message here..."
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => setIsMessageOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!user) {
                      toast.error('Please log in to send a message');
                      navigate('/login');
                      return;
                    }
                    
                    if (!messageText.trim()) return;
                    
                    setIsSendingMessage(true);
                    
                    const { conversation, error } = await getOrCreateConversation(user.id, event.host.id);
                    
                    if (error) {
                      toast.error(error);
                      setIsSendingMessage(false);
                      return;
                    }
                    
                    const { message, error: sendMessageError } = await sendMessage(conversation.id, user.id, messageText);
                    
                    if (sendMessageError) {
                      toast.error(sendMessageError);
                      setIsSendingMessage(false);
                      return;
                    }
                    
                    setIsMessageOpen(false);
                    setMessageText('');
                    toast.success('Message sent to host!');
                    setIsSendingMessage(false);
                  }}
                  className="flex-1 bg-black hover:bg-gray-800"
                >
                  {isSendingMessage ? (
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.928l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Comments */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 mb-6">
          <h2 className="font-semibold mb-4">Comments</h2>
          <div className="space-y-4 mb-4">
            {event.comments && event.comments.length > 0 ? (
              event.comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.userAvatar} />
                    <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{comment.userName}</p>
                      {comment.isHost && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                          Host
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first!</p>
            )}
          </div>
          {/* Show comment input only for host and accepted guests */}
          {user && (isHost || currentUserRSVP?.status === 'accepted') ? (
            <div className="border-t border-gray-200 pt-4">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                placeholder="Add a comment..."
              />
              <Button
                onClick={handleAddComment}
                className="w-full bg-black hover:bg-gray-800 mt-2"
                disabled={!commentText.trim() || isPostingComment}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </div>
          ) : user ? (
            <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
              Only the host and accepted guests can comment
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
              Please log in to comment
            </div>
          )}
        </div>
        
        {/* Native Ad */}
        <NativeAd />
      </div>
      
      {/* RSVP Button - Only show for upcoming events */}
      {!isHost && !isEventEnded && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={handleRSVP}
              className={`w-full ${
                currentUserRSVP?.status === 'pending'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : currentUserRSVP?.status === 'accepted'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-black hover:bg-gray-800'
              }`}
              disabled={spotsLeft !== null && spotsLeft <= 0 || currentUserRSVP?.status === 'declined' || isRSVPing}
            >
              {currentUserRSVP?.status === 'pending'
                ? 'Waiting for Approval...'
                : currentUserRSVP?.status === 'accepted'
                ? '✓ You\'re Approved!'
                : currentUserRSVP?.status === 'declined'
                ? 'Request Declined'
                : spotsLeft !== null && spotsLeft <= 0
                ? 'Event Full'
                : 'Join Event'}
            </Button>
          </div>
        </div>
      )}

      {/* Host Button - Manage RSVPs - Only for upcoming events */}
      {isHost && !isEventEnded && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={() => setIsAttendeesModalOpen(true)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Users className="w-4 h-4 mr-2" />
              You're Hosting - Manage RSVPs ({rsvps.filter(r => r.status === 'pending').length} pending)
            </Button>
          </div>
        </div>
      )}

      {/* Past Event Info - Show for ended events */}
      {isEventEnded && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-300 p-4 shadow-lg">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isHost
                  ? `${event.attendees} people attended your event`
                  : hasApprovedRSVP
                  ? 'You attended this event'
                  : 'This event has ended'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Attendees Modal */}
      <AttendeesModal
        isOpen={isAttendeesModalOpen}
        onClose={() => setIsAttendeesModalOpen(false)}
        attendees={event.rsvps || []}
        hostId={event.host.id}
        hostName={event.host.name}
        hostAvatar={event.host.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.host.name}`}
        eventTitle={event.title}
        currentUserId={user?.id}
        onUserClick={(userId) => {
          // Navigate to user profile
          navigate(`/profile/${userId}`);
        }}
        onApprove={async (userId) => {
          if (!user?.id) return;
          
          console.log('🎯 Approving RSVP for user:', userId);
          
          // Optimistically update the UI immediately
          setEvent(prevEvent => {
            if (!prevEvent) return prevEvent;
            
            const updatedRsvps = prevEvent.rsvps?.map(rsvp => 
              rsvp.userId === userId 
                ? { ...rsvp, status: 'accepted' as const }
                : rsvp
            ) || [];
            
            // Count accepted RSVPs + 1 for host
            const acceptedCount = updatedRsvps.filter(r => r.status === 'accepted').length + 1;
            
            return {
              ...prevEvent,
              rsvps: updatedRsvps,
              attendees: acceptedCount,
            };
          });
          
          // Show success immediately
          toast.success('RSVP approved!');
          
          // Update database in background
          const { success, error } = await updateRSVPStatus(event.id, userId, 'accepted', user.id);
          
          if (!success) {
            // If it fails, revert the optimistic update
            toast.error(error || 'Failed to approve RSVP');
            
            // Refetch to get the correct state
            try {
              const url = `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events/${event.id}`;
              const response = await fetch(url, {
                headers: {
                  Authorization: `Bearer ${publicAnonKey}`,
                },
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.event) {
                  setEvent(data.event);
                  setRsvps(data.rsvps || []);
                }
              }
            } catch (err) {
              console.error('Error refetching event:', err);
            }
          }
        }}
        onDecline={async (userId) => {
          if (!user?.id) return;
          
          const { success, error } = await updateRSVPStatus(event.id, userId, 'declined', user.id);
          
          if (success) {
            toast.success('RSVP declined');
            // Reload event data
            try {
              const url = `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events/${event.id}`;
              const response = await fetch(url, {
                headers: {
                  Authorization: `Bearer ${publicAnonKey}`,
                },
              });
              if (response.ok) {
                const data = await response.json();
                if (data.event) {
                  setEvent(data.event);
                  setRsvps(data.rsvps || []);
                }
              }
            } catch (err) {
              console.error('Error refetching event:', err);
            }
          } else {
            toast.error(error || 'Failed to decline RSVP');
          }
        }}
      />
    </div>
  );
}