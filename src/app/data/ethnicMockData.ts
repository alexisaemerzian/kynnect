import { Event, User, Place } from '../types';

// ============================================
// ARMENIAN DATA
// ============================================

export const armenianEvents: Event[] = [
  {
    id: '1',
    title: 'Armenian Wine Tasting at Ararat Winery',
    date: 'Tonight at 8:00 PM',
    location: 'Glendale, CA',
    address: '123 Brand Blvd, Glendale, CA 91203',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
    type: 'spontaneous',
    attendees: 12,
    host: {
      id: '1',
      name: 'Armen Petrosyan',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Impromptu wine tasting featuring Armenian wines. Bring your favorite bottle to share!',
    showAddress: false,
    rsvps: [
      { userId: '5', userName: 'Ani Grigoryan', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80', status: 'pending' },
      { userId: '6', userName: 'Levon Sarkisian', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', status: 'pending' },
    ],
  },
  {
    id: '2',
    title: 'Dolma Making Class & Dinner',
    date: 'Tomorrow at 6:30 PM',
    location: 'Glendale, CA',
    address: '456 Central Ave, Glendale, CA 91203',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    type: 'curated',
    attendees: 28,
    host: {
      id: '2',
      name: 'Lusine Avetisyan',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Learn to make traditional Armenian dolma from scratch. Dinner included!',
    showAddress: true,
    attendeesList: [
      { id: '3', name: 'Tigran Khachatryan', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80' },
    ],
  },
  {
    id: '3',
    title: 'System of a Down Tribute Night',
    date: 'Sat, Mar 27 at 9:00 PM',
    location: 'Los Angeles, CA',
    address: '789 Sunset Blvd, Los Angeles, CA 90028',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    type: 'curated',
    attendees: 45,
    host: {
      id: '3',
      name: 'Vahagn Manukyan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    description: 'Celebrating Armenian rock legends with a live tribute band!',
    showAddress: true,
  },
  {
    id: '4',
    title: 'Armenian Genocide Memorial Service',
    date: 'Sun, Apr 24 at 10:00 AM',
    location: 'Glendale, CA',
    address: '321 Church St, Glendale, CA 91205',
    imageUrl: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80',
    type: 'curated',
    attendees: 150,
    host: {
      id: '4',
      name: 'Father Mesrop Gabrielyan',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Annual memorial service honoring the victims. Community gathering after.',
    showAddress: true,
  },
  {
    id: '5',
    title: 'Armenian Jazz Night at Le Petit Ararat',
    date: 'Tonight at 9:00 PM',
    location: 'Paris, France',
    address: '45 Rue Jean-Pierre Timbaud, Paris 75011',
    imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80',
    type: 'spontaneous',
    attendees: 18,
    host: {
      id: '5',
      name: 'Aram Khatchaturian',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    description: 'Live Armenian jazz fusion in the heart of Paris! Wine and mezze included.',
    showAddress: false,
    rsvps: [],
  },
  {
    id: '6',
    title: 'Yerevan Film Festival Screening',
    date: 'Fri, Apr 1 at 7:00 PM',
    location: 'Sydney, Australia',
    address: '234 Pitt St, Sydney NSW 2000',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    type: 'curated',
    attendees: 65,
    host: {
      id: '6',
      name: 'Anahit Gevorgyan',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Screening contemporary Armenian cinema with Q&A and Armenian snacks!',
    showAddress: true,
  },
  {
    id: '7',
    title: 'Armenian Easter Celebration',
    date: 'Sun, Apr 17 at 11:00 AM',
    location: 'Toronto, Canada',
    address: '615 Stuart Ave, Toronto ON M6H 3J1',
    imageUrl: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&q=80',
    type: 'curated',
    attendees: 200,
    host: {
      id: '7',
      name: 'Father Hakob Shahnazaryan',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Traditional Armenian Easter service followed by community feast with pakhlava!',
    showAddress: true,
  },
  {
    id: '8',
    title: 'Backgammon Tournament & Raki Night',
    date: 'Tomorrow at 8:00 PM',
    location: 'Beirut, Lebanon',
    address: 'Bourj Hammoud, Beirut',
    imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80',
    type: 'spontaneous',
    attendees: 24,
    host: {
      id: '8',
      name: 'Kevork Balian',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Friendly tavloo competition with Armenian mezze and raki! All skill levels welcome.',
    showAddress: false,
    rsvps: [],
  },
  {
    id: '9',
    title: 'Armenian Dance Practice - Kochari & Shalakho',
    date: 'Wed, Mar 23 at 7:00 PM',
    location: 'Glendale, CA',
    address: '789 Glenoaks Blvd, Glendale, CA 91202',
    imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80',
    type: 'curated',
    attendees: 35,
    host: {
      id: '9',
      name: 'Narine Harutyunyan',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    },
    description: 'Learn traditional Armenian dances! All ages welcome, no experience needed.',
    showAddress: true,
  },
  {
    id: '10',
    title: 'Late Night Shawarma Run',
    date: 'Tonight at 11:30 PM',
    location: 'Glendale, CA',
    address: 'Central Ave, Glendale, CA',
    imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
    type: 'spontaneous',
    attendees: 8,
    host: {
      id: '10',
      name: 'Raffi Vardanyan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    description: 'Who wants shawarma? Meeting at Zankou in 30 mins!',
    showAddress: false,
    rsvps: [
      { userId: '11', userName: 'Sako Mkhitaryan', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80', status: 'pending' },
    ],
  },
  {
    id: '11',
    title: 'Armenian Business Network Mixer',
    date: 'Thu, Mar 24 at 6:30 PM',
    location: 'Los Angeles, CA',
    address: '8484 Wilshire Blvd, Beverly Hills, CA 90211',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
    type: 'curated',
    attendees: 85,
    host: {
      id: '12',
      name: 'Arman Karapetyan',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Professional networking for Armenian entrepreneurs and business owners. Appetizers and drinks included.',
    showAddress: true,
  },
  {
    id: '12',
    title: 'Komitas Chamber Music Concert',
    date: 'Sat, Apr 2 at 8:00 PM',
    location: 'Paris, France',
    address: '8 Rue Jean Goujon, Paris 75008',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80',
    type: 'curated',
    attendees: 120,
    host: {
      id: '13',
      name: 'Lilit Mkrtchyan',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Classical Armenian music featuring works by Komitas and Khachaturian.',
    showAddress: true,
  },
  {
    id: '13',
    title: 'Kebab & Soccer - Armenia vs Ireland Match',
    date: 'Tue, Mar 22 at 3:00 PM',
    location: 'Yerevan, Armenia',
    address: 'Abovyan St 12, Yerevan',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    type: 'spontaneous',
    attendees: 45,
    host: {
      id: '14',
      name: 'Tigran Sargsyan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    description: 'Watch the match together! Khorovats and beer provided.',
    showAddress: true,
  },
  {
    id: '14',
    title: 'Mount Ararat Hiking Group',
    date: 'Sun, Apr 3 at 6:00 AM',
    location: 'Glendale, CA',
    address: 'Deukmejian Wilderness Park, Glendale, CA',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    type: 'curated',
    attendees: 22,
    host: {
      id: '15',
      name: 'Ani Saryan',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    },
    description: 'Morning hike for Armenian fitness enthusiasts. Coffee after at Porto\'s!',
    showAddress: true,
  },
  {
    id: '15',
    title: 'Armenian Poetry Night - Charents & Sevak',
    date: 'Fri, Apr 1 at 8:00 PM',
    location: 'Moscow, Russia',
    address: 'Armyansky Pereulok 2, Moscow 101000',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    type: 'curated',
    attendees: 38,
    host: {
      id: '16',
      name: 'Hovhannes Tumanyan',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Evening of Armenian poetry readings in Russian and Armenian. Wine & snacks included.',
    showAddress: true,
  },
];

export const armenianUsers: User[] = [
  {
    id: '1',
    name: 'Armen Petrosyan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Glendale, CA',
    bio: 'Born in Yerevan, living the dream in California. Love hosting wine nights and exploring Armenian cuisine. Բարև to all my հայեր! 🇦🇲',
    eventsHosted: 24,
    eventsAttended: 67,
  },
];

export const armenianPlaces: Place[] = [
  { id: '1', name: 'Raffi\'s Place', type: 'restaurant', city: 'Glendale, CA', address: '211 E Broadway, Glendale, CA', cuisine: 'Armenian', description: 'Authentic Armenian cuisine, famous for khorovats', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.8 },
  { id: '2', name: 'St. Mary Armenian Apostolic Church', type: 'church', city: 'Glendale, CA', address: '500 S Central Ave, Glendale, CA', description: 'Active Armenian Apostolic church community', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.9 },
  { id: '3', name: 'Carousel Restaurant', type: 'restaurant', city: 'Glendale, CA', address: '304 N Brand Blvd, Glendale, CA', cuisine: 'Armenian', description: 'Upscale Armenian & Mediterranean dining', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', rating: 4.7 },
  { id: '4', name: 'Mini Kabob', type: 'cafe', city: 'Glendale, CA', address: '313 Vine St, Glendale, CA', cuisine: 'Armenian', description: 'Fast-casual Armenian grill', imageUrl: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', rating: 4.6 },
];

// ============================================
// GREEK DATA
// ============================================

export const greekEvents: Event[] = [
  {
    id: 'gr1',
    title: 'Taverna Night - Live Bouzouki Music',
    date: 'Tonight at 8:00 PM',
    location: 'Astoria, NY',
    address: '123 Ditmars Blvd, Astoria, NY 11105',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    type: 'spontaneous',
    attendees: 18,
    host: {
      id: 'gr1',
      name: 'Nikos Papadopoulos',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Spontaneous bouzouki night with ouzo and mezze! Opa! 🇬🇷',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'gr2',
    title: 'Greek Easter BBQ - Souvlaki & Lamb',
    date: 'Sun, Apr 10 at 2:00 PM',
    location: 'Astoria, NY',
    address: '456 Steinway St, Astoria, NY 11103',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    type: 'curated',
    attendees: 65,
    host: {
      id: 'gr2',
      name: 'Maria Katsaros',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Celebrating Pascha with traditional lamb on the spit, souvlaki, and Greek dancing!',
    showAddress: true,
  },
  {
    id: 'gr3',
    title: 'Rembetiko Music Night',
    date: 'Fri, Mar 25 at 9:00 PM',
    location: 'Astoria, NY',
    address: '789 Broadway, Astoria, NY 11106',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    type: 'curated',
    attendees: 42,
    host: {
      id: 'gr3',
      name: 'Dimitris Vasilakis',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Live Rembetiko - the Greek blues. Bring your baglama!',
    showAddress: true,
  },
  {
    id: 'gr4',
    title: 'Melbourne Greek Festival - Yiasou!',
    date: 'Sat, Apr 2 at 12:00 PM',
    location: 'Melbourne, Australia',
    address: 'Lonsdale St, Melbourne VIC 3000',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80',
    type: 'curated',
    attendees: 350,
    host: {
      id: 'gr4',
      name: 'Kostas Nikolaidis',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    description: 'Huge Greek street festival with gyros, live music, and plate smashing!',
    showAddress: true,
  },
  {
    id: 'gr5',
    title: 'Ouzo & Greek Philosophy Discussion',
    date: 'Tomorrow at 7:00 PM',
    location: 'Toronto, Canada',
    address: '456 Danforth Ave, Toronto ON M4K 1P5',
    imageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
    type: 'spontaneous',
    attendees: 14,
    host: {
      id: 'gr5',
      name: 'Eleni Christopoulos',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Deep conversations over ouzo and feta in the Greektown! 🍷',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'gr6',
    title: 'Greek Independence Day Parade',
    date: 'Fri, Mar 25 at 11:00 AM',
    location: 'London, UK',
    address: 'Trafalgar Square, London WC2N 5DN',
    imageUrl: 'https://images.unsplash.com/photo-1489914169085-9b54fdd8f2a2?w=800&q=80',
    type: 'curated',
    attendees: 180,
    host: {
      id: 'gr6',
      name: 'Andreas Pappas',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Celebrating Greek independence with parade and traditional dances!',
    showAddress: true,
  },
];

export const greekUsers: User[] = [
  {
    id: 'gr1',
    name: 'Nikos Papadopoulos',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Astoria, NY',
    bio: 'From Athens, now in Astoria. Love hosting Greek nights with good food, ouzo, and music. Γεια σου! 🇬🇷',
    eventsHosted: 31,
    eventsAttended: 52,
  },
];

export const greekPlaces: Place[] = [
  { id: 'gr1', name: 'Taverna Kyclades', type: 'restaurant', city: 'Astoria, NY', address: '33-07 Ditmars Blvd, Astoria, NY', cuisine: 'Greek', description: 'Fresh seafood & traditional Greek dishes', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.8 },
  { id: 'gr2', name: 'Greek Orthodox Cathedral', type: 'church', city: 'Astoria, NY', address: '319 E 74th St, New York, NY', description: 'Historic Greek Orthodox community', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.9 },
  { id: 'gr3', name: 'Titan Foods', type: 'shop', city: 'Astoria, NY', address: '25-56 31st St, Astoria, NY', cuisine: 'Greek', description: 'Greek grocery with imported products', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80', rating: 4.7 },
];

// ============================================
// ITALIAN DATA
// ============================================

export const italianEvents: Event[] = [
  {
    id: 'it1',
    title: 'Sunday Gravy Dinner - Nonna\'s Recipe',
    date: 'Tonight at 7:00 PM',
    location: 'Brooklyn, NY',
    address: '123 Mulberry St, Brooklyn, NY 11201',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    type: 'spontaneous',
    attendees: 14,
    host: {
      id: 'it1',
      name: 'Giovanni Romano',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Making Sunday gravy just like Nonna taught me. Bring wine! 🍷',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'it2',
    title: 'Festa di San Gennaro Block Party',
    date: 'Sat, Sep 17 at 12:00 PM',
    location: 'New York, NY',
    address: 'Mulberry St, Little Italy, NY 10013',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80',
    type: 'curated',
    attendees: 250,
    host: {
      id: 'it2',
      name: 'Maria Esposito',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Annual Italian street festival with food, music, and zeppole!',
    showAddress: true,
  },
  {
    id: 'it3',
    title: 'Homemade Pasta Workshop',
    date: 'Sun, Mar 27 at 3:00 PM',
    location: 'Brooklyn, NY',
    address: '456 Court St, Brooklyn, NY 11231',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    type: 'curated',
    attendees: 22,
    host: {
      id: 'it3',
      name: 'Antonio Ricci',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Learn to make fresh pasta from scratch - ravioli, fettuccine, gnocchi!',
    showAddress: true,
  },
  {
    id: 'it4',
    title: 'Italian Heritage Night - Toronto',
    date: 'Fri, Apr 8 at 7:00 PM',
    location: 'Toronto, Canada',
    address: '614 College St, Toronto ON M6G 1B4',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80',
    type: 'curated',
    attendees: 120,
    host: {
      id: 'it4',
      name: 'Francesca Bianchi',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Celebrating Italian culture in Little Italy with live opera and gelato!',
    showAddress: true,
  },
  {
    id: 'it5',
    title: 'Espresso & Cannoli Social',
    date: 'Tomorrow at 3:00 PM',
    location: 'Melbourne, Australia',
    address: '123 Lygon St, Carlton VIC 3053',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    type: 'spontaneous',
    attendees: 16,
    host: {
      id: 'it5',
      name: 'Luca Moretti',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    description: 'Afternoon espresso and sweets at the best Italian cafe in Carlton!',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'it6',
    title: 'Italian Football Watch Party - Azzurri!',
    date: 'Sat, Apr 2 at 2:00 PM',
    location: 'Buenos Aires, Argentina',
    address: 'Calle Defensa 456, San Telmo, Buenos Aires',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    type: 'curated',
    attendees: 80,
    host: {
      id: 'it6',
      name: 'Marco Rossi',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Watch Italy play with pizza, beer, and passionate Italian-Argentines! Forza Azzurri! ⚽',
    showAddress: true,
  },
];

export const italianUsers: User[] = [
  {
    id: 'it1',
    name: 'Giovanni Romano',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Brooklyn, NY',
    bio: 'Third generation Italian-American. Family from Napoli. Cooking, espresso, and calcio. Ciao paesani! 🇮🇹',
    eventsHosted: 28,
    eventsAttended: 61,
  },
];

export const italianPlaces: Place[] = [
  { id: 'it1', name: 'Rubirosa', type: 'restaurant', city: 'New York, NY', address: '235 Mulberry St, New York, NY', cuisine: 'Italian', description: 'Famous thin-crust pizza & classic Italian', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.8 },
  { id: 'it2', name: 'St. Patrick\'s Old Cathedral', type: 'church', city: 'New York, NY', address: '263 Mulberry St, New York, NY', description: 'Historic Italian-American parish', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.7 },
  { id: 'it3', name: 'Di Palo\'s', type: 'shop', city: 'New York, NY', address: '200 Grand St, New York, NY', cuisine: 'Italian', description: 'Family-owned Italian specialty foods since 1925', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80', rating: 4.9 },
];

// ============================================
// MEXICAN DATA
// ============================================

export const mexicanEvents: Event[] = [
  {
    id: 'mx1',
    title: 'Taco Tuesday - Homemade Al Pastor',
    date: 'Tonight at 7:00 PM',
    location: 'Los Angeles, CA',
    address: '123 Olvera St, Los Angeles, CA 90012',
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
    type: 'spontaneous',
    attendees: 22,
    host: {
      id: 'mx1',
      name: 'Carlos Hernández',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: '¡Taquiza! Bringing the trompo, you bring the salsa. BYOB 🌮',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'mx2',
    title: 'Día de los Muertos Celebration',
    date: 'Tue, Nov 1 at 6:00 PM',
    location: 'Los Angeles, CA',
    address: '456 César Chávez Ave, Los Angeles, CA 90033',
    imageUrl: 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=800&q=80',
    type: 'curated',
    attendees: 180,
    host: {
      id: 'mx2',
      name: 'Lupita Morales',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Traditional ofrenda, pan de muerto, and mariachi music to honor our ancestors',
    showAddress: true,
  },
  {
    id: 'mx3',
    title: 'Lucha Libre Viewing Party',
    date: 'Fri, Mar 25 at 8:00 PM',
    location: 'Los Angeles, CA',
    address: '789 E 1st St, Los Angeles, CA 90012',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    type: 'curated',
    attendees: 55,
    host: {
      id: 'mx3',
      name: 'Miguel Ramirez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Live stream of AAA wrestling with micheladas and botanas!',
    showAddress: true,
  },
];

export const mexicanUsers: User[] = [
  {
    id: 'mx1',
    name: 'Carlos Hernández',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Los Angeles, CA',
    bio: 'From Guadalajara, repping la raza in LA. Love futbol, tacos, and good mezcal. ¡Órale! 🇲🇽',
    eventsHosted: 35,
    eventsAttended: 73,
  },
];

export const mexicanPlaces: Place[] = [
  { id: 'mx1', name: 'Guelaguetza', type: 'restaurant', city: 'Los Angeles, CA', address: '3337 W 8th St, Los Angeles, CA', cuisine: 'Mexican', description: 'Authentic Oaxacan cuisine & mezcal', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.8 },
  { id: 'mx2', name: 'La Placita', type: 'church', city: 'Los Angeles, CA', address: '535 N Main St, Los Angeles, CA', description: 'Historic Mexican-American parish', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.7 },
  { id: 'mx3', name: 'El Mercadito', type: 'shop', city: 'Los Angeles, CA', address: '1941 E 1st St, Los Angeles, CA', cuisine: 'Mexican', description: 'Traditional Mexican market with fresh produce', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80', rating: 4.6 },
];

// ============================================
// IRISH DATA
// ============================================

export const irishEvents: Event[] = [
  {
    id: 'ie1',
    title: 'Pub Quiz Night at O\'Malley\'s',
    date: 'Tonight at 8:00 PM',
    location: 'Boston, MA',
    address: '123 State St, Boston, MA 02109',
    imageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
    type: 'spontaneous',
    attendees: 16,
    host: {
      id: 'ie1',
      name: 'Liam O\'Connor',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Craic agus ceol! Trivia, Guinness, and good company 🍺',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'ie2',
    title: 'St. Patrick\'s Day Parade & Party',
    date: 'Thu, Mar 17 at 10:00 AM',
    location: 'Boston, MA',
    address: 'Broadway, South Boston, MA 02127',
    imageUrl: 'https://images.unsplash.com/photo-1489914169085-9b54fdd8f2a2?w=800&q=80',
    type: 'curated',
    attendees: 500,
    host: {
      id: 'ie2',
      name: 'Siobhan Murphy',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'South Boston parade followed by ceili dancing and Irish stew!',
    showAddress: true,
  },
  {
    id: 'ie3',
    title: 'Traditional Irish Music Session',
    date: 'Sat, Mar 26 at 7:00 PM',
    location: 'Boston, MA',
    address: '456 Dorchester Ave, Boston, MA 02127',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    type: 'curated',
    attendees: 30,
    host: {
      id: 'ie3',
      name: 'Padraig Kelly',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Trad session with fiddles, bodhráns, and tin whistles. All welcome!',
    showAddress: true,
  },
];

export const irishUsers: User[] = [
  {
    id: 'ie1',
    name: 'Liam O\'Connor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Boston, MA',
    bio: 'From Cork, living in Southie. Gaelic football, trad music, and finding the best pint in Boston. Sláinte! 🇮🇪',
    eventsHosted: 26,
    eventsAttended: 58,
  },
];

export const irishPlaces: Place[] = [
  { id: 'ie1', name: 'The Banshee', type: 'restaurant', city: 'Boston, MA', address: '934 Dorchester Ave, Boston, MA', cuisine: 'Irish', description: 'Traditional Irish pub with live music', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.7 },
  { id: 'ie2', name: 'Gate of Heaven Church', type: 'church', city: 'Boston, MA', address: '615 E Broadway, South Boston, MA', description: 'Historic Irish Catholic parish', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.8 },
  { id: 'ie3', name: 'Eire Pub', type: 'cafe', city: 'Boston, MA', address: '795 Adams St, Boston, MA', cuisine: 'Irish', description: 'Authentic Irish pub atmosphere', imageUrl: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', rating: 4.6 },
];

// ============================================
// KOREAN DATA
// ============================================

export const koreanEvents: Event[] = [
  {
    id: 'kr1',
    title: 'KBBQ & Soju Night',
    date: 'Tonight at 8:00 PM',
    location: 'Koreatown, LA',
    address: '123 W 6th St, Los Angeles, CA 90014',
    imageUrl: 'https://images.unsplash.com/photo-1588561604823-f51d1a1c34d1?w=800&q=80',
    type: 'spontaneous',
    attendees: 10,
    host: {
      id: 'kr1',
      name: 'Kim Min-Jun',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Spontaneous KBBQ session! Let\'s eat some galbi and samgyupsal 🥩',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'kr2',
    title: 'K-Pop Dance Class & Social',
    date: 'Sat, Mar 26 at 4:00 PM',
    location: 'Koreatown, LA',
    address: '456 S Western Ave, Los Angeles, CA 90020',
    imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80',
    type: 'curated',
    attendees: 45,
    host: {
      id: 'kr2',
      name: 'Park Ji-Woo',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Learn BTS and BLACKPINK choreography! All levels welcome 💃',
    showAddress: true,
  },
  {
    id: 'kr3',
    title: 'Chuseok Harvest Festival Celebration',
    date: 'Sun, Sep 11 at 2:00 PM',
    location: 'Koreatown, LA',
    address: '789 S Vermont Ave, Los Angeles, CA 90005',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80',
    type: 'curated',
    attendees: 120,
    host: {
      id: 'kr3',
      name: 'Lee Sang-Hoon',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Traditional Chuseok with songpyeon, Korean folk games, and hanbok photos!',
    showAddress: true,
  },
];

export const koreanUsers: User[] = [
  {
    id: 'kr1',
    name: 'Kim Min-Jun',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Los Angeles, CA',
    bio: 'From Seoul, now in K-Town LA. Love KBBQ, PC방, and K-dramas. 안녕하세요! 🇰🇷',
    eventsHosted: 19,
    eventsAttended: 44,
  },
];

export const koreanPlaces: Place[] = [
  { id: 'kr1', name: 'Kang Ho-Dong Baekjeong', type: 'restaurant', city: 'Los Angeles, CA', address: '3465 W 6th St, Los Angeles, CA', cuisine: 'Korean', description: 'Premium Korean BBQ experience', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.7 },
  { id: 'kr2', name: 'Olympic Korean Church', type: 'church', city: 'Los Angeles, CA', address: '3281 W 6th St, Los Angeles, CA', description: 'Large Korean-American church community', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.6 },
  { id: 'kr3', name: 'H Mart', type: 'shop', city: 'Los Angeles, CA', address: '621 S Western Ave, Los Angeles, CA', cuisine: 'Korean', description: 'Korean supermarket with food court', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80', rating: 4.5 },
];

// ============================================
// FILIPINO DATA
// ============================================

export const filipinoEvents: Event[] = [
  {
    id: 'ph1',
    title: 'Kamayan Feast - Eat with Your Hands!',
    date: 'Tonight at 7:00 PM',
    location: 'Daly City, CA',
    address: '123 Mission St, Daly City, CA 94014',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    type: 'spontaneous',
    attendees: 20,
    host: {
      id: 'ph1',
      name: 'Juan dela Cruz',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Traditional Filipino feast on banana leaves! Bring your appetite 🍽️',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'ph2',
    title: 'Barrio Fiesta - Filipino Cultural Festival',
    date: 'Sat, Jun 11 at 11:00 AM',
    location: 'Daly City, CA',
    address: '456 Serramonte Blvd, Daly City, CA 94015',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80',
    type: 'curated',
    attendees: 300,
    host: {
      id: 'ph2',
      name: 'Maria Santos',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Filipino food, tinikling dancing, karaoke, and community celebration!',
    showAddress: true,
  },
  {
    id: 'ph3',
    title: 'Videoke Night - Filipino Style Karaoke',
    date: 'Fri, Mar 25 at 9:00 PM',
    location: 'Daly City, CA',
    address: '789 Geneva Ave, Daly City, CA 94014',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    type: 'curated',
    attendees: 35,
    host: {
      id: 'ph3',
      name: 'Miguel Reyes',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Sing your heart out with San Miguel and sisig! My Way not allowed 😂',
    showAddress: true,
  },
];

export const filipinoUsers: User[] = [
  {
    id: 'ph1',
    name: 'Juan dela Cruz',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Daly City, CA',
    bio: 'From Manila, living in Little Manila. Love basketball, lechon, and karaoke. Mabuhay! 🇵🇭',
    eventsHosted: 22,
    eventsAttended: 49,
  },
];

export const filipinoPlaces: Place[] = [
  { id: 'ph1', name: 'Tselogs', type: 'restaurant', city: 'Daly City, CA', address: '201 Lake Merced Blvd, Daly City, CA', cuisine: 'Filipino', description: 'Filipino breakfast & comfort food', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.6 },
  { id: 'ph2', name: 'St. Francis of Assisi', type: 'church', city: 'Daly City, CA', address: '1425 Bay Rd, East Palo Alto, CA', description: 'Large Filipino Catholic community', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.7 },
  { id: 'ph3', name: 'Seafood City', type: 'shop', city: 'Daly City, CA', address: '5122 Junipero Serra Blvd, Colma, CA', cuisine: 'Filipino', description: 'Filipino supermarket & food court', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80', rating: 4.5 },
];

// ============================================
// POLISH DATA
// ============================================

export const polishEvents: Event[] = [
  {
    id: 'pl1',
    title: 'Pierogi Making Party',
    date: 'Tonight at 6:00 PM',
    location: 'Chicago, IL',
    address: '123 N Milwaukee Ave, Chicago, IL 60642',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    type: 'spontaneous',
    attendees: 15,
    host: {
      id: 'pl1',
      name: 'Piotr Kowalski',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Making pierogi ruskie and kapusta! Bring vodka 🥟',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'pl2',
    title: 'Polish Constitution Day Parade',
    date: 'Sat, May 7 at 12:00 PM',
    location: 'Chicago, IL',
    address: 'Columbus Dr, Chicago, IL 60601',
    imageUrl: 'https://images.unsplash.com/photo-1489914169085-9b54fdd8f2a2?w=800&q=80',
    type: 'curated',
    attendees: 200,
    host: {
      id: 'pl2',
      name: 'Anna Nowak',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Celebrating Polish pride with parade, polka dancing, and kielbasa!',
    showAddress: true,
  },
  {
    id: 'pl3',
    title: 'Polka Dance Night',
    date: 'Fri, Mar 25 at 8:00 PM',
    location: 'Chicago, IL',
    address: '456 W Division St, Chicago, IL 60610',
    imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80',
    type: 'curated',
    attendees: 50,
    host: {
      id: 'pl3',
      name: 'Marek Wójcik',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Live polka band! Learn traditional Polish dances. Na zdrowie!',
    showAddress: true,
  },
];

export const polishUsers: User[] = [
  {
    id: 'pl1',
    name: 'Piotr Kowalski',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Chicago, IL',
    bio: 'From Warsaw, proud Chicagoan. Love pierogi, Polish beer, and Chicago sports. Cześć! 🇵🇱',
    eventsHosted: 17,
    eventsAttended: 38,
  },
];

export const polishPlaces: Place[] = [
  { id: 'pl1', name: 'Podhalanka', type: 'restaurant', city: 'Chicago, IL', address: '1549 W Division St, Chicago, IL', cuisine: 'Polish', description: 'Traditional Polish restaurant with live music', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.7 },
  { id: 'pl2', name: 'St. Stanislaus Kostka Church', type: 'church', city: 'Chicago, IL', address: '1327 N Noble St, Chicago, IL', description: 'Historic Polish parish in Chicago', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.8 },
  { id: 'pl3', name: 'Andy\'s Deli', type: 'shop', city: 'Chicago, IL', address: '5442 N Milwaukee Ave, Chicago, IL', cuisine: 'Polish', description: 'Polish deli with imported goods', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80', rating: 4.6 },
];

// ============================================
// LEBANESE DATA
// ============================================

export const lebaneseEvents: Event[] = [
  {
    id: 'lb1',
    title: 'Hookah & Backgammon Night',
    date: 'Tonight at 9:00 PM',
    location: 'Dearborn, MI',
    address: '123 Warren Ave, Dearborn, MI 48126',
    imageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
    type: 'spontaneous',
    attendees: 12,
    host: {
      id: 'lb1',
      name: 'Karim Haddad',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Argileh and tawleh! Bring your best trash talk 🎲',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'lb2',
    title: 'Lebanese Independence Day Dabke',
    date: 'Tue, Nov 22 at 7:00 PM',
    location: 'Dearborn, MI',
    address: '456 Schaefer Rd, Dearborn, MI 48126',
    imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80',
    type: 'curated',
    attendees: 150,
    host: {
      id: 'lb2',
      name: 'Layla Khoury',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Celebrating Lebanon with dabke dancing, meze, and live music!',
    showAddress: true,
  },
  {
    id: 'lb3',
    title: 'Mezze & Arak Tasting Evening',
    date: 'Sat, Mar 26 at 8:00 PM',
    location: 'Dearborn, MI',
    address: '789 Michigan Ave, Dearborn, MI 48126',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    type: 'curated',
    attendees: 35,
    host: {
      id: 'lb3',
      name: 'Nabil Saab',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Traditional Lebanese mezze spread with arak. Sahten!',
    showAddress: true,
  },
];

export const lebaneseUsers: User[] = [
  {
    id: 'lb1',
    name: 'Karim Haddad',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Dearborn, MI',
    bio: 'From Beirut, now in Dearborn. Love tabbouleh, cedar trees, and good arak. Marhaba! 🇱🇧',
    eventsHosted: 21,
    eventsAttended: 47,
  },
];

export const lebanesePlaces: Place[] = [
  { id: 'lb1', name: 'Al-Ameer Restaurant', type: 'restaurant', city: 'Dearborn, MI', address: '12710 W Warren Ave, Dearborn, MI', cuisine: 'Lebanese', description: 'Authentic Lebanese cuisine & charcoal grill', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.8 },
  { id: 'lb2', name: 'St. Sharbel Maronite Catholic Church', type: 'church', city: 'Dearborn, MI', address: '466 Walnut St, Saint Clair Shores, MI', description: 'Lebanese Maronite community', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.7 },
  { id: 'lb3', name: 'Shatila Bakery', type: 'cafe', city: 'Dearborn, MI', address: '14300 W Warren Ave, Dearborn, MI', cuisine: 'Lebanese', description: 'Famous Lebanese pastries & sweets', imageUrl: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', rating: 4.9 },
];

// ============================================
// JEWISH DATA
// ============================================

export const jewishEvents: Event[] = [
  {
    id: 'jw1',
    title: 'Shabbat Dinner - Homemade Challah',
    date: 'Tonight at 7:00 PM',
    location: 'Brooklyn, NY',
    address: '123 Ocean Pkwy, Brooklyn, NY 11218',
    imageUrl: 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=800&q=80',
    type: 'spontaneous',
    attendees: 18,
    host: {
      id: 'jw1',
      name: 'David Cohen',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Spontaneous Shabbat dinner! Bring wine and good vibes. All denominations welcome 🕎',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'jw2',
    title: 'Purim Carnival & Megillah Reading',
    date: 'Sun, Mar 20 at 5:00 PM',
    location: 'Brooklyn, NY',
    address: '456 Avenue M, Brooklyn, NY 11230',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80',
    type: 'curated',
    attendees: 120,
    host: {
      id: 'jw2',
      name: 'Rachel Goldstein',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Celebrate Purim with hamantaschen, costume contest, and megillah reading!',
    showAddress: true,
  },
  {
    id: 'jw3',
    title: 'Israeli Dancing & Falafel Night',
    date: 'Thu, Mar 24 at 8:00 PM',
    location: 'Los Angeles, CA',
    address: '789 Pico Blvd, Los Angeles, CA 90035',
    imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80',
    type: 'curated',
    attendees: 45,
    host: {
      id: 'jw3',
      name: 'Yael Levi',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    },
    description: 'Learn Israeli folk dances! Fresh falafel and hummus included. L\'chaim!',
    showAddress: true,
  },
  {
    id: 'jw4',
    title: 'Passover Seder - Young Professionals',
    date: 'Fri, Apr 15 at 6:00 PM',
    location: 'Brooklyn, NY',
    address: '234 Eastern Pkwy, Brooklyn, NY 11238',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    type: 'curated',
    attendees: 32,
    host: {
      id: 'jw4',
      name: 'Jonathan Rosenberg',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Traditional Passover seder for young professionals. Full meal included!',
    showAddress: true,
  },
  {
    id: 'jw5',
    title: 'Late Night Kosher Pizza Run',
    date: 'Tonight at 11:00 PM',
    location: 'Brooklyn, NY',
    address: 'Avenue J, Brooklyn, NY',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    type: 'spontaneous',
    attendees: 8,
    host: {
      id: 'jw5',
      name: 'Michael Schwartz',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    description: 'Who wants pizza? Meeting at J2 in 30 mins!',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'jw6',
    title: 'Hanukkah Party - 8 Nights of Latkes',
    date: 'Wed, Dec 7 at 7:00 PM',
    location: 'Tel Aviv, Israel',
    address: '456 Dizengoff St, Tel Aviv',
    imageUrl: 'https://images.unsplash.com/photo-1482575832494-771f74bf6857?w=800&q=80',
    type: 'curated',
    attendees: 85,
    host: {
      id: 'jw6',
      name: 'Sarah Abramov',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Hanukkah celebration with unlimited latkes, sufganiyot, and dreidel tournament!',
    showAddress: true,
  },
];

export const jewishUsers: User[] = [
  {
    id: 'jw1',
    name: 'David Cohen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Brooklyn, NY',
    bio: 'Brooklyn born, love hosting Shabbat, Israeli politics debates, and finding the best hummus. Shalom mishpacha! 🇮🇱',
    eventsHosted: 29,
    eventsAttended: 54,
  },
];

export const jewishPlaces: Place[] = [
  { id: 'jw1', name: 'Liebman\'s Kosher Deli', type: 'restaurant', city: 'Bronx, NY', address: '552 W 235th St, Bronx, NY', cuisine: 'Jewish', description: 'Classic kosher deli since 1953', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.8 },
  { id: 'jw2', name: 'Congregation Beth Elohim', type: 'church', city: 'Brooklyn, NY', address: '274 Garfield Pl, Brooklyn, NY', description: 'Historic Reform synagogue', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.9 },
  { id: 'jw3', name: 'Pomegranate Supermarket', type: 'shop', city: 'Brooklyn, NY', address: '1507 Coney Island Ave, Brooklyn, NY', cuisine: 'Jewish', description: 'Kosher supermarket with Israeli products', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80', rating: 4.7 },
];

// ============================================
// NIGERIAN DATA
// ============================================

export const nigerianEvents: Event[] = [
  {
    id: 'ng1',
    title: 'Jollof Rice Cook-Off - Naija vs Ghana',
    date: 'Tonight at 7:00 PM',
    location: 'Houston, TX',
    address: '123 Hillcroft Ave, Houston, TX 77081',
    imageUrl: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80',
    type: 'spontaneous',
    attendees: 24,
    host: {
      id: 'ng1',
      name: 'Chukwuemeka Okonkwo',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Let\'s settle this! Nigerian jollof vs Ghanaian jollof. BYOB (Bring Your Own Bowl) 🍚',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'ng2',
    title: 'Afrobeats Dance Party - Burna Boy Night',
    date: 'Sat, Mar 26 at 10:00 PM',
    location: 'Houston, TX',
    address: '456 Bissonnet St, Houston, TX 77005',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    type: 'curated',
    attendees: 150,
    host: {
      id: 'ng2',
      name: 'Ngozi Adeyemi',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'All-night Afrobeats party! Burna Boy, Wizkid, Davido, Tiwa Savage. Come ready to dance!',
    showAddress: true,
  },
  {
    id: 'ng3',
    title: 'Nigerian Independence Day Celebration',
    date: 'Fri, Oct 1 at 6:00 PM',
    location: 'Houston, TX',
    address: '789 Harwin Dr, Houston, TX 77036',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80',
    type: 'curated',
    attendees: 200,
    host: {
      id: 'ng3',
      name: 'Oluwaseun Balogun',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Celebrating Nigeria\'s independence with traditional foods, music, and fashion show!',
    showAddress: true,
  },
  {
    id: 'ng4',
    title: 'Suya & Football - Super Eagles Match',
    date: 'Tomorrow at 3:00 PM',
    location: 'London, UK',
    address: '123 Peckham High St, London SE15 5EB',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    type: 'spontaneous',
    attendees: 35,
    host: {
      id: 'ng4',
      name: 'Adeola Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    description: 'Watch Super Eagles play! Suya, pepper soup, and Star beer. Naija for life! ⚽',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'ng5',
    title: 'Nollywood Movie Night & Owambe',
    date: 'Fri, Apr 1 at 8:00 PM',
    location: 'Atlanta, GA',
    address: '456 Memorial Dr, Atlanta, GA 30312',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    type: 'curated',
    attendees: 65,
    host: {
      id: 'ng5',
      name: 'Chiamaka Nwosu',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Nollywood classics screening followed by owambe party with live DJ and Nigerian food!',
    showAddress: true,
  },
  {
    id: 'ng6',
    title: 'Lagos Street Food Festival',
    date: 'Sun, Apr 10 at 2:00 PM',
    location: 'New York, NY',
    address: '789 Flatbush Ave, Brooklyn, NY 11226',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    type: 'curated',
    attendees: 180,
    host: {
      id: 'ng6',
      name: 'Babatunde Adewale',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Taste of Lagos! Suya, puff puff, chin chin, plantain, and more. E go set! 🔥',
    showAddress: true,
  },
];

export const nigerianUsers: User[] = [
  {
    id: 'ng1',
    name: 'Chukwuemeka Okonkwo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Houston, TX',
    bio: 'From Lagos, now in Houston. Love jollof rice debates, Afrobeats, and Super Eagles. Naija no dey carry last! 🇳🇬',
    eventsHosted: 32,
    eventsAttended: 68,
  },
];

export const nigerianPlaces: Place[] = [
  { id: 'ng1', name: 'Finger Licking Restaurant', type: 'restaurant', city: 'Houston, TX', address: '10503 Fondren Rd, Houston, TX', cuisine: 'Nigerian', description: 'Authentic Nigerian cuisine - jollof, egusi, pounded yam', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.7 },
  { id: 'ng2', name: 'Redeemed Christian Church', type: 'church', city: 'Houston, TX', address: '8445 Westpark Dr, Houston, TX', description: 'Large Nigerian church community', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.8 },
  { id: 'ng3', name: 'African Food Market', type: 'shop', city: 'Houston, TX', address: '9311 W Sam Houston Pkwy S, Houston, TX', cuisine: 'Nigerian', description: 'Nigerian groceries and ingredients', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80', rating: 4.6 },
];

// ============================================
// CHINESE DATA
// ============================================

export const chineseEvents: Event[] = [
  {
    id: 'cn1',
    title: 'Hot Pot Night - Sichuan Style',
    date: 'Tonight at 8:00 PM',
    location: 'San Francisco, CA',
    address: '123 Clement St, San Francisco, CA 94118',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    type: 'spontaneous',
    attendees: 16,
    host: {
      id: 'cn1',
      name: 'Wei Zhang',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Spicy hot pot session! Bring your favorite ingredients. 火锅走起！',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'cn2',
    title: 'Lunar New Year Celebration - Year of the Dragon',
    date: 'Sat, Jan 22 at 6:00 PM',
    location: 'San Francisco, CA',
    address: '456 Grant Ave, San Francisco, CA 94108',
    imageUrl: 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=800&q=80',
    type: 'curated',
    attendees: 250,
    host: {
      id: 'cn2',
      name: 'Li Chen',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Grand Chinese New Year feast with lion dance, dumplings, and red envelopes! 新年快乐！',
    showAddress: true,
  },
  {
    id: 'cn3',
    title: 'Mahjong Tournament & Dim Sum',
    date: 'Sun, Mar 27 at 11:00 AM',
    location: 'New York, NY',
    address: '789 Mott St, New York, NY 10013',
    imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80',
    type: 'curated',
    attendees: 40,
    host: {
      id: 'cn3',
      name: 'Ming Wang',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Mahjong competition with authentic Cantonese dim sum. All skill levels welcome!',
    showAddress: true,
  },
  {
    id: 'cn4',
    title: 'KTV Karaoke Marathon - Mandopop & Cantopop',
    date: 'Fri, Apr 1 at 9:00 PM',
    location: 'Los Angeles, CA',
    address: '234 N Broadway, Los Angeles, CA 90012',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    type: 'curated',
    attendees: 28,
    host: {
      id: 'cn4',
      name: 'Jia Liu',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'All-night KTV! Jay Chou, Eason Chan, Teresa Teng. Private rooms available!',
    showAddress: true,
  },
  {
    id: 'cn5',
    title: 'Bubble Tea Social & Night Market',
    date: 'Tomorrow at 7:00 PM',
    location: 'Vancouver, Canada',
    address: '456 Kingsway, Vancouver BC V5T 3J9',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80',
    type: 'spontaneous',
    attendees: 22,
    host: {
      id: 'cn5',
      name: 'Yuki Lin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    },
    description: 'Exploring Richmond Night Market! Meet for boba first then food crawl 🧋',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'cn6',
    title: 'Mid-Autumn Festival - Mooncake Making',
    date: 'Sun, Sep 18 at 3:00 PM',
    location: 'Toronto, Canada',
    address: '789 Spadina Ave, Toronto ON M5S 2J3',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    type: 'curated',
    attendees: 55,
    host: {
      id: 'cn6',
      name: 'Hui Zhao',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Learn to make traditional mooncakes! Tea ceremony and lanterns included. 中秋节快乐！',
    showAddress: true,
  },
];

export const chineseUsers: User[] = [
  {
    id: 'cn1',
    name: 'Wei Zhang',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'San Francisco, CA',
    bio: 'From Shanghai, now in SF. Love hot pot, mahjong, and finding the best XLB. 你好华人朋友们！🇨🇳',
    eventsHosted: 27,
    eventsAttended: 59,
  },
];

export const chinesePlaces: Place[] = [
  { id: 'cn1', name: 'Din Tai Fung', type: 'restaurant', city: 'San Francisco, CA', address: '2700 Sloat Blvd, San Francisco, CA', cuisine: 'Chinese', description: 'World-famous soup dumplings (XLB)', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.8 },
  { id: 'cn2', name: 'Chinese Baptist Church', type: 'church', city: 'San Francisco, CA', address: '15 Waverly Pl, San Francisco, CA', description: 'Historic Chinatown church community', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.7 },
  { id: 'cn3', name: '99 Ranch Market', type: 'shop', city: 'San Francisco, CA', address: '4299 Geary Blvd, San Francisco, CA', cuisine: 'Chinese', description: 'Asian supermarket chain with Chinese groceries', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80', rating: 4.6 },
];

// ============================================
// INDIAN DATA
// ============================================

export const indianEvents: Event[] = [
  {
    id: 'in1',
    title: 'Desi House Party - Bollywood Night',
    date: 'Tonight at 9:00 PM',
    location: 'Edison, NJ',
    address: '123 Oak Tree Rd, Edison, NJ 08820',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    type: 'spontaneous',
    attendees: 28,
    host: {
      id: 'in1',
      name: 'Raj Patel',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Desi party! Bollywood music, bhangra dancing, and samosas. BYOB 🎵',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'in2',
    title: 'Diwali Festival of Lights Celebration',
    date: 'Sun, Oct 24 at 6:00 PM',
    location: 'Edison, NJ',
    address: '456 Plainfield Ave, Edison, NJ 08817',
    imageUrl: 'https://images.unsplash.com/photo-1604429070105-0291735922d2?w=800&q=80',
    type: 'curated',
    attendees: 300,
    host: {
      id: 'in2',
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Grand Diwali celebration with diyas, rangoli, Indian sweets, and fireworks! Happy Diwali!',
    showAddress: true,
  },
  {
    id: 'in3',
    title: 'Cricket Watch Party - India vs Pakistan',
    date: 'Sat, Apr 2 at 9:00 AM',
    location: 'Fremont, CA',
    address: '789 Mowry Ave, Fremont, CA 94536',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    type: 'curated',
    attendees: 120,
    host: {
      id: 'in3',
      name: 'Arjun Mehta',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'The biggest rivalry in cricket! Watch with fellow desis. Chai and pakoras provided! 🏏',
    showAddress: true,
  },
  {
    id: 'in4',
    title: 'Holi Color Festival - Spring Celebration',
    date: 'Sat, Mar 19 at 12:00 PM',
    location: 'Jersey City, NJ',
    address: '234 Newark Ave, Jersey City, NJ 07302',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80',
    type: 'curated',
    attendees: 200,
    host: {
      id: 'in4',
      name: 'Neha Kapoor',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Celebrate Holi with colors, music, and traditional sweets! Wear white clothes. Holi Hai!',
    showAddress: true,
  },
  {
    id: 'in5',
    title: 'Late Night Pani Puri Run',
    date: 'Tonight at 10:00 PM',
    location: 'Jackson Heights, NY',
    address: '74th St, Jackson Heights, NY 11372',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
    type: 'spontaneous',
    attendees: 12,
    host: {
      id: 'in5',
      name: 'Karan Singh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    description: 'Craving street food! Meet on 74th for pani puri, pav bhaji, and dosa!',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'in6',
    title: 'Garba Night - Navratri Celebration',
    date: 'Fri, Oct 7 at 8:00 PM',
    location: 'Fremont, CA',
    address: '456 Civic Center Dr, Fremont, CA 94538',
    imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80',
    type: 'curated',
    attendees: 350,
    host: {
      id: 'in6',
      name: 'Anjali Desai',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    },
    description: 'Traditional Garba and Dandiya Raas! Wear your best chaniya choli and kediyus!',
    showAddress: true,
  },
];

export const indianUsers: User[] = [
  {
    id: 'in1',
    name: 'Raj Patel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Edison, NJ',
    bio: 'From Mumbai, now in Little India NJ. Love cricket, Bollywood, and spicy food debates. Namaste desis! 🇮🇳',
    eventsHosted: 38,
    eventsAttended: 82,
  },
];

export const indianPlaces: Place[] = [
  { id: 'in1', name: 'Dosa Hutt', type: 'restaurant', city: 'Edison, NJ', address: '1654 Oak Tree Rd, Edison, NJ', cuisine: 'Indian', description: 'South Indian dosas and uttapam', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.7 },
  { id: 'in2', name: 'BAPS Shri Swaminarayan Mandir', type: 'church', city: 'Edison, NJ', address: '112 N Main St, Edison, NJ', description: 'Beautiful Hindu temple and community center', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.9 },
  { id: 'in3', name: 'Patel Brothers', type: 'shop', city: 'Edison, NJ', address: '1988 Oak Tree Rd, Edison, NJ', cuisine: 'Indian', description: 'Indian grocery chain with fresh produce and spices', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80', rating: 4.6 },
];

// ============================================
// BRAZILIAN DATA
// ============================================

export const brazilianEvents: Event[] = [
  {
    id: 'br1',
    title: 'Feijoada Sunday - Brazilian BBQ',
    date: 'Tonight at 3:00 PM',
    location: 'Newark, NJ',
    address: '123 Ferry St, Newark, NJ 07105',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    type: 'spontaneous',
    attendees: 20,
    host: {
      id: 'br1',
      name: 'Bruno Silva',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Traditional feijoada! Bring caipirinha ingredients. Vamos! 🇧🇷',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'br2',
    title: 'Carnaval Block Party - Samba All Night',
    date: 'Sat, Feb 25 at 8:00 PM',
    location: 'Miami, FL',
    address: '456 NW 7th Ave, Miami, FL 33136',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80',
    type: 'curated',
    attendees: 400,
    host: {
      id: 'br2',
      name: 'Camila Santos',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Miami Carnaval! Samba, batucada, sequins, and all-night dancing! Carnaval chegou!',
    showAddress: true,
  },
  {
    id: 'br3',
    title: 'Forró Dance Night - Nordeste Vibes',
    date: 'Fri, Mar 25 at 9:00 PM',
    location: 'Framingham, MA',
    address: '789 Waverly St, Framingham, MA 01702',
    imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80',
    type: 'curated',
    attendees: 55,
    host: {
      id: 'br3',
      name: 'Rafael Oliveira',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Learn forró dancing! Live accordion music and caipirinhas. All levels welcome!',
    showAddress: true,
  },
  {
    id: 'br4',
    title: 'Brazilian Football Watch Party - Seleção',
    date: 'Tomorrow at 3:00 PM',
    location: 'Newark, NJ',
    address: '234 Ferry St, Newark, NJ 07105',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    type: 'spontaneous',
    attendees: 45,
    host: {
      id: 'br4',
      name: 'Lucas Costa',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    description: 'Brazil match! Caipirinhas, pão de queijo, and churrasco. Vai Brasil! ⚽',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'br5',
    title: 'Brazilian BBQ (Churrasco) Cookout',
    date: 'Sun, Apr 3 at 1:00 PM',
    location: 'Boca Raton, FL',
    address: '456 Yamato Rd, Boca Raton, FL 33431',
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80',
    type: 'curated',
    attendees: 80,
    host: {
      id: 'br5',
      name: 'Juliana Ferreira',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'All-you-can-eat churrasco with picanha, farofa, and brigadeiro for dessert!',
    showAddress: true,
  },
  {
    id: 'br6',
    title: 'Bossa Nova Jazz Night',
    date: 'Sat, Apr 9 at 8:00 PM',
    location: 'New York, NY',
    address: '789 W 46th St, New York, NY 10036',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    type: 'curated',
    attendees: 65,
    host: {
      id: 'br6',
      name: 'Gabriela Almeida',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    },
    description: 'Live bossa nova and MPB! João Gilberto, Tom Jobim tribute. Muito bom!',
    showAddress: true,
  },
];

export const brazilianUsers: User[] = [
  {
    id: 'br1',
    name: 'Bruno Silva',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Newark, NJ',
    bio: 'From São Paulo, living the Brazilian life in Ironbound. Futebol, churrasco, and samba! Oi galera! 🇧🇷',
    eventsHosted: 31,
    eventsAttended: 64,
  },
];

export const brazilianPlaces: Place[] = [
  { id: 'br1', name: 'Brasilia Grill', type: 'restaurant', city: 'Newark, NJ', address: '132 Ferry St, Newark, NJ', cuisine: 'Brazilian', description: 'Authentic Brazilian churrascaria', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.8 },
  { id: 'br2', name: 'Nossa Senhora de Fátima Church', type: 'church', city: 'Newark, NJ', address: '222 Lafayette St, Newark, NJ', description: 'Brazilian Catholic community', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.7 },
  { id: 'br3', name: 'Seabra Foods', type: 'shop', city: 'Newark, NJ', address: '87 Madison St, Newark, NJ', cuisine: 'Brazilian', description: 'Brazilian supermarket with fresh products', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80', rating: 4.6 },
];

// ============================================
// PERSIAN DATA
// ============================================

export const persianEvents: Event[] = [
  {
    id: 'pr1',
    title: 'Persian Tea & Backgammon Night',
    date: 'Tonight at 8:00 PM',
    location: 'Beverly Hills, CA',
    address: '123 Westwood Blvd, Los Angeles, CA 90024',
    imageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
    type: 'spontaneous',
    attendees: 14,
    host: {
      id: 'pr1',
      name: 'Reza Hosseini',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
    description: 'Chai, takhte nard (backgammon), and good conversation. Befarma! ☕',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'pr2',
    title: 'Nowruz Persian New Year Celebration',
    date: 'Fri, Mar 18 at 7:00 PM',
    location: 'Beverly Hills, CA',
    address: '456 S Beverly Dr, Beverly Hills, CA 90212',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80',
    type: 'curated',
    attendees: 200,
    host: {
      id: 'pr2',
      name: 'Leila Ahmadi',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Grand Nowruz celebration with haft-seen, Persian food, and live music! Sale no mobarak!',
    showAddress: true,
  },
  {
    id: 'pr3',
    title: 'Kabob & Poetry Night - Hafez Readings',
    date: 'Sat, Mar 26 at 7:00 PM',
    location: 'Los Angeles, CA',
    address: '789 Westwood Blvd, Los Angeles, CA 90024',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    type: 'curated',
    attendees: 45,
    host: {
      id: 'pr3',
      name: 'Dariush Karimi',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    description: 'Evening of Persian poetry with kabob, saffron rice, and doogh. Hafez and Rumi readings!',
    showAddress: true,
  },
  {
    id: 'pr4',
    title: 'Yalda Night - Winter Solstice Celebration',
    date: 'Tue, Dec 20 at 8:00 PM',
    location: 'Vienna, Austria',
    address: '234 Taborstrasse, Vienna 1020',
    imageUrl: 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=800&q=80',
    type: 'curated',
    attendees: 60,
    host: {
      id: 'pr4',
      name: 'Shirin Rezaei',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
    description: 'Longest night of the year! Pomegranates, watermelon, nuts, and Shahnameh stories!',
    showAddress: true,
  },
  {
    id: 'pr5',
    title: 'Late Night Tahdig Run',
    date: 'Tonight at 10:30 PM',
    location: 'Los Angeles, CA',
    address: 'Westwood Blvd, Los Angeles, CA',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    type: 'spontaneous',
    attendees: 10,
    host: {
      id: 'pr5',
      name: 'Arash Sadeghi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    description: 'Craving tahdig! Meeting at Shamshiri in 30 mins. Who\'s in?',
    showAddress: false,
    rsvps: [],
  },
  {
    id: 'pr6',
    title: 'Persian Classical Music Concert',
    date: 'Sun, Apr 10 at 7:00 PM',
    location: 'San Diego, CA',
    address: '456 Park Blvd, San Diego, CA 92101',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80',
    type: 'curated',
    attendees: 90,
    host: {
      id: 'pr6',
      name: 'Nazanin Farsi',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    },
    description: 'Live Persian classical music featuring tar, setar, and tombak. Traditional tea service!',
    showAddress: true,
  },
];

export const persianUsers: User[] = [
  {
    id: 'pr1',
    name: 'Reza Hosseini',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    city: 'Beverly Hills, CA',
    bio: 'From Tehran, now in Tehrangeles. Love Persian poetry, kabob, and backgammon nights. Salam! 🇮🇷',
    eventsHosted: 26,
    eventsAttended: 55,
  },
];

export const persianPlaces: Place[] = [
  { id: 'pr1', name: 'Shamshiri Grill', type: 'restaurant', city: 'Los Angeles, CA', address: '1712 Westwood Blvd, Los Angeles, CA', cuisine: 'Persian', description: 'Persian kabobs and traditional dishes', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.8 },
  { id: 'pr2', name: 'Sinai Temple', type: 'church', city: 'Los Angeles, CA', address: '10400 Wilshire Blvd, Los Angeles, CA', description: 'Persian Jewish community center', imageUrl: 'https://images.unsplash.com/photo-1548625361-5c52f1aae531?w=800&q=80', rating: 4.7 },
  { id: 'pr3', name: 'Super Irvine', type: 'shop', city: 'Irvine, CA', address: '18040 Culver Dr, Irvine, CA', cuisine: 'Persian', description: 'Persian supermarket with fresh herbs and ingredients', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80', rating: 4.6 },
];

// ============================================
// HELPER FUNCTION
// ============================================

interface EthnicData {
  events: Event[];
  users: User[];
  places: Place[];
}

export function getEthnicData(ethnicityId: string): EthnicData {
  const dataMap: Record<string, EthnicData> = {
    armenian: { events: armenianEvents, users: armenianUsers, places: armenianPlaces },
    greek: { events: greekEvents, users: greekUsers, places: greekPlaces },
    italian: { events: italianEvents, users: italianUsers, places: italianPlaces },
    mexican: { events: mexicanEvents, users: mexicanUsers, places: mexicanPlaces },
    irish: { events: irishEvents, users: irishUsers, places: irishPlaces },
    korean: { events: koreanEvents, users: koreanUsers, places: koreanPlaces },
    filipino: { events: filipinoEvents, users: filipinoUsers, places: filipinoPlaces },
    polish: { events: polishEvents, users: polishUsers, places: polishPlaces },
    lebanese: { events: lebaneseEvents, users: lebaneseUsers, places: lebanesePlaces },
    jewish: { events: jewishEvents, users: jewishUsers, places: jewishPlaces },
    nigerian: { events: nigerianEvents, users: nigerianUsers, places: nigerianPlaces },
    chinese: { events: chineseEvents, users: chineseUsers, places: chinesePlaces },
    indian: { events: indianEvents, users: indianUsers, places: indianPlaces },
    brazilian: { events: brazilianEvents, users: brazilianUsers, places: brazilianPlaces },
    persian: { events: persianEvents, users: persianUsers, places: persianPlaces },
  };

  // Return specific ethnicity data or default to Armenian
  return dataMap[ethnicityId] || dataMap.armenian;
}