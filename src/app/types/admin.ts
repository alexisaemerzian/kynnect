export interface Ad {
  id: string;
  ethnicityId: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  active: boolean;
  createdAt: string;
  adType: 'main' | 'local'; // main = ethnicity-wide, local = city-specific
  city?: string; // only for local ads
}

export interface SponsoredEventAd {
  id: string;
  ethnicityId: string;
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  eventDate: string;
  eventTime: string;
  imageUrl: string;
  sponsorName: string;
  sponsorContact: string;
  price: number;
  active: boolean;
  createdAt: string;
}

export interface EventPromotion {
  id: string;
  eventId: string;
  ethnicityId: string;
  requestedBy: string;
  requestedByName: string;
  status: 'pending' | 'approved' | 'rejected';
  price: number;
  duration: number; // days
  createdAt: string;
  approvedAt?: string;
}