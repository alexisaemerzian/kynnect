export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'curated' | 'spontaneous';
  city?: string; // Make optional, can be derived from location
  location: string;
  date: string;
  time?: string; // Make optional - can be combined with date
  address?: string; // Add address field
  host: {
    id?: string;
    name: string;
    avatar: string;
    isOrganization?: boolean;
    organizationName?: string;
    organizationType?: string;
  };
  attendees: number;
  maxAttendees?: number;
  imageUrl: string;
  tags?: string[]; // Make optional
  coordinates?: {
    lat: number;
    lng: number;
  };
  attendeesList?: User[];
  createdAt?: string; // For auto-expiry calculation
  comments?: Comment[];
  rsvps?: EventRSVP[]; // Track RSVPs with approval status
  showAddress?: boolean; // Add this field for approval-based address reveal
  addressVisibility?: 'public' | 'rsvp_required'; // New field: public = visible to all of ethnicity, rsvp_required = only approved RSVPs
}

export interface EventRSVP {
  userId: string;
  userName: string;
  userAvatar: string;
  status: 'pending' | 'accepted' | 'declined';
  requestedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  isHost?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  city: string;
  bio: string;
  eventsHosted: number;
  eventsAttended: number;
}

export interface Place {
  id: string;
  name: string;
  type: 'restaurant' | 'cafe' | 'church' | 'bakery' | 'shop' | 'other';
  city: string;
  address: string;
  description: string;
  imageUrl?: string; // Make optional - can be added later
  coordinates?: { // Make optional - can be geocoded later
    lat: number;
    lng: number;
  };
  phone?: string;
  website?: string;
  rating?: number; // Make optional - will be calculated from reviews
  cuisine?: string; // Make optional - only for restaurants
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    city: string;
  };
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  eventContext?: {
    id: string;
    title: string;
  };
}