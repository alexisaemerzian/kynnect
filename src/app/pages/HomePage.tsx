import { useState, Fragment, useEffect } from 'react';
import { EventCard } from '../components/EventCard';
import { BottomNav } from '../components/BottomNav';
import { EventsMapView } from '../components/EventsMapView';
import { CalendarView } from '../components/CalendarView';
import { NativeAd } from '../components/NativeAd';
import { CustomAd } from '../components/CustomAd';
import { EthnicitySwitcher } from '../components/EthnicitySwitcher';
import { useEthnicity } from '../context/EthnicityContext';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';
import { useAdminData } from '../context/AdminDataContext';
import { getEthnicityData } from '../data/getEthnicityData';
import { getEventsByEthnicity } from '../../lib/supabaseEvents';
import type { Event } from '../types';
import { Input } from '../components/ui/input';
import { MapIcon, List, Search, Calendar, Bell } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { differenceInHours, isToday, isThisWeek } from 'date-fns';
import { useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';

export function HomePage() {
  const { selectedEthnicity } = useEthnicity();
  const { isAuthenticated, loading, userId } = useAuth();
  const { unreadCount } = useFollow();
  const navigate = useNavigate();
  const location = useLocation();
  const { getApprovedPromotedEventIds, getAdsByEthnicityAndCity } = useAdminData();
  
  // ALL useState hooks must be at the top, before any conditional returns
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [activeTab, setActiveTab] = useState<'now' | 'week'>('now');
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'calendar'>('list');
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh trigger
  
  // Load events from Supabase
  useEffect(() => {
    async function loadEvents() {
      if (!selectedEthnicity) return;
      
      console.log('🔄 Loading events for ethnicity:', selectedEthnicity.id);
      setIsLoadingEvents(true);
      const { events: loadedEvents, error } = await getEventsByEthnicity(selectedEthnicity.id);
      
      if (error) {
        console.error('❌ Error loading events:', error);
        toast.error('Failed to load events');
      } else {
        console.log('✅ Events loaded from database:', loadedEvents.length, loadedEvents);
        console.log('📊 First event ID (if any):', loadedEvents[0]?.id);
        console.log('📊 All event IDs:', loadedEvents.map(e => e.id));
        setEvents(loadedEvents);
      }
      
      setIsLoadingEvents(false);
    }
    
    loadEvents();
  }, [selectedEthnicity, location.key, location.search, refreshKey]); // Reload when navigating back to this page or search params change
  
  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-xs text-gray-400 mt-2">Auth loading: {String(loading)}</p>
          <p className="text-xs text-gray-400">Authenticated: {String(isAuthenticated)}</p>
          <p className="text-xs text-gray-400">Ethnicity: {selectedEthnicity?.name || 'none'}</p>
        </div>
      </div>
    );
  }

  // If no ethnicity selected, redirect to onboarding
  if (!selectedEthnicity) {
    navigate('/');
    return null;
  }
  
  const ethnicityData = getEthnicityData(selectedEthnicity?.id || 'armenian');

  // Get promoted event IDs for this ethnicity
  const promotedEventIds = getApprovedPromotedEventIds(selectedEthnicity?.id || '');
  
  // Get ads for this ethnicity - includes both main ads and city-specific ads
  const allAds = getAdsByEthnicityAndCity(selectedEthnicity?.id || '', searchCity || undefined);
  const mainAds = allAds.filter(ad => ad.adType === 'main');
  const localAds = allAds.filter(ad => ad.adType === 'local');
  const hasAds = allAds.length > 0;

  // Filter events based on search and tab
  const filteredEvents = events.filter(event => {
    // Parse event date/time - handle both ISO strings and simple date strings
    let eventDate: Date;
    
    // Extract just the date part (YYYY-MM-DD) from ISO string if needed
    const dateOnly = event.date.split('T')[0]; // Get "2026-03-27" from "2026-03-27T00:00:00+00:00"
    
    if (event.time) {
      // Combine date and time: "2026-03-27T20:18"
      eventDate = new Date(dateOnly + 'T' + event.time);
    } else {
      // Just the date
      eventDate = new Date(dateOnly);
    }
    
    const cityMatch = !searchCity || event.city?.toLowerCase().includes(searchCity.toLowerCase());
    
    if (activeTab === 'now') {
      // Events happening TODAY only - show events happening today or right now
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const isToday = eventDate >= startOfToday && eventDate <= endOfToday;
      console.log('📍 [NOW Tab] Event:', event.title, '| Date:', event.date, event.time, '| Parsed:', eventDate.toLocaleString(), '| Is today:', isToday);
      return cityMatch && isToday;
    } else {
      // Events this week - show all upcoming events within the next 7 days
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfWeek = new Date(startOfToday);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      
      const isInRange = eventDate >= startOfToday && eventDate <= endOfWeek;
      
      // Debug logging
      console.log('📅 [WEEK Tab] Event:', event.title, '| Date:', event.date, event.time, '| Parsed:', eventDate.toLocaleString(), '| In range:', isInRange, '| Window:', startOfToday.toLocaleDateString(), '-', endOfWeek.toLocaleDateString());
      
      return cityMatch && isInRange;
    }
  });
  
  console.log(`🔍 Total events: ${events.length} | Filtered (${activeTab}): ${filteredEvents.length}`);
  
  // Sort by time - closest first
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateOnlyA = a.date.split('T')[0];
    const dateOnlyB = b.date.split('T')[0];
    const dateA = a.time ? new Date(dateOnlyA + 'T' + a.time) : new Date(dateOnlyA);
    const dateB = b.time ? new Date(dateOnlyB + 'T' + b.time) : new Date(dateOnlyB);
    return dateA.getTime() - dateB.getTime();
  });
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-5">
          {/* Ethnicity Switcher - Only show if user has multiple */}
          <div className="flex justify-center mb-4">
            <EthnicitySwitcher />
          </div>

          {/* App Name & Tagline */}
          <div className="mb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl">{selectedEthnicity?.flag}</span>
              <h1 className="text-2xl font-bold tracking-tight">{selectedEthnicity?.displayName}</h1>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">21+</span>
            </div>
            <p className="text-gray-400 text-xs">
              {selectedEthnicity?.tagline}
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{selectedEthnicity?.greeting}</h2>
              <p className="text-gray-400 text-xs">Discover your community</p>
            </div>
            <div className="flex gap-2">
              {/* Notifications Bell */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
                className="text-white hover:bg-white/10 relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={`text-white hover:bg-white/10 ${viewMode === 'calendar' ? 'bg-white/20' : ''}`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                className={`text-white hover:bg-white/10 ${viewMode === 'map' ? 'bg-white/20' : ''}`}
              >
                {viewMode === 'list' ? (
                  <>
                    <MapIcon className="w-4 h-4 mr-2" />
                    Map
                  </>
                ) : viewMode === 'map' ? (
                  <>
                    <List className="w-4 h-4 mr-2" />
                    List
                  </>
                ) : (
                  <>
                    <MapIcon className="w-4 h-4 mr-2" />
                    Map
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by city..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[172px] z-30">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="grid grid-cols-2 flex-1">
              <button
                onClick={() => setActiveTab('now')}
                className={`text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'now'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚡ Happening Now
              </button>
              <button
                onClick={() => setActiveTab('week')}
                className={`text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'week'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🗓️ This Week
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                setRefreshKey(prev => prev + 1);
                toast.info('Refreshing events...');
              }}
              disabled={isLoadingEvents}
              className="ml-2 text-xs"
            >
              {isLoadingEvents ? '⏳' : '🔄'} Refresh
            </Button>
          </div>
          {/* Debug info */}
          <div className="text-[10px] text-gray-400 py-1 border-t border-gray-100">
            Events: {events.length} | Showing: {sortedEvents.length} | Loading: {String(isLoadingEvents)}
          </div>
        </div>
      </div>
      
      {/* Content */}
      {viewMode === 'list' ? (
        <div className="max-w-2xl mx-auto px-4 py-6">
          {activeTab === 'now' && (
            <div className="space-y-3">
              {/* Main Ads (Universal - shown to all ethnicities) */}
              {mainAds.length > 0 && (
                <div className="mb-4">
                  {mainAds.map((ad) => (
                    <div key={ad.id} className="mb-3">
                      <CustomAd ad={ad} />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Local Ads (City-specific for this ethnicity) */}
              {localAds.length > 0 && searchCity && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 px-1">Local businesses in {searchCity}</p>
                  {localAds.map((ad) => (
                    <div key={ad.id} className="mb-3">
                      <CustomAd ad={ad} />
                    </div>
                  ))}
                </div>
              )}
              
              {sortedEvents.length > 0 ? (
                sortedEvents.map((event, index) => (
                  <Fragment key={`event-${event.id}-${index}`}>
                    <EventCard event={event} showTimeCountdown />
                    {/* Show placeholder ad after 4th event, then normal ads after every 4th */}
                    {(index + 1) % 4 === 0 && index !== sortedEvents.length - 1 && (
                      <NativeAd variant="event-feed" showPlaceholder={index === 3} />
                    )}
                  </Fragment>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No events happening right now.</p>
                  <p className="text-sm mt-1">Be the first to post a hang!</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'week' && (
            <div className="space-y-3">
              {/* Main Ads (Universal - shown to all ethnicities) */}
              {mainAds.length > 0 && (
                <div className="mb-4">
                  {mainAds.map((ad) => (
                    <div key={ad.id} className="mb-3">
                      <CustomAd ad={ad} />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Local Ads (City-specific for this ethnicity) */}
              {localAds.length > 0 && searchCity && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 px-1">Local businesses in {searchCity}</p>
                  {localAds.map((ad) => (
                    <div key={ad.id} className="mb-3">
                      <CustomAd ad={ad} />
                    </div>
                  ))}
                </div>
              )}
              
              {sortedEvents.length > 0 ? (
                sortedEvents.map((event, index) => (
                  <Fragment key={`event-${event.id}-${index}`}>
                    <EventCard event={event} />
                    {/* Show native ad after every 4th event */}
                    {(index + 1) % 4 === 0 && index !== sortedEvents.length - 1 && (
                      <NativeAd variant="event-feed" />
                    )}
                  </Fragment>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No events this week yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : viewMode === 'map' ? (
        <EventsMapView events={sortedEvents} userId={userId} />
      ) : (
        <div className="max-w-2xl mx-auto px-4 py-6">
          <CalendarView events={sortedEvents} />
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}