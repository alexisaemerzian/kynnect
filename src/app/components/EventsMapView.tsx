import { useEffect, useRef } from 'react';
import { Event } from '../types';
import { useNavigate } from 'react-router';
import { Badge } from './ui/badge';
import { Users, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for curated (purple) and spontaneous (orange) events
const purpleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface EventsMapViewProps {
  events: Event[];
  userId?: string; // Current user ID to check RSVP status
}

export function EventsMapView({ events, userId }: EventsMapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Calculate center based on all events
    const getMapCenter = (): [number, number] => {
      if (events.length === 0) {
        return [40, -20]; // Center of Atlantic, shows both continents
      }
      
      const validEvents = events.filter(e => e.coordinates);
      if (validEvents.length === 0) {
        return [40, -20];
      }
      
      // Calculate average lat/lng
      const avgLat = validEvents.reduce((sum, e) => sum + e.coordinates!.lat, 0) / validEvents.length;
      const avgLng = validEvents.reduce((sum, e) => sum + e.coordinates!.lng, 0) / validEvents.length;
      
      return [avgLat, avgLng];
    };
    
    // Calculate appropriate zoom level based on event spread
    const getZoomLevel = (): number => {
      if (events.length <= 1) return 11;
      
      const validEvents = events.filter(e => e.coordinates);
      if (validEvents.length <= 1) return 11;
      
      // Calculate the span of coordinates
      const lats = validEvents.map(e => e.coordinates!.lat);
      const lngs = validEvents.map(e => e.coordinates!.lng);
      
      const latSpan = Math.max(...lats) - Math.min(...lats);
      const lngSpan = Math.max(...lngs) - Math.min(...lngs);
      const maxSpan = Math.max(latSpan, lngSpan);
      
      // Determine zoom based on span
      if (maxSpan > 100) return 2;  // Global view
      if (maxSpan > 50) return 3;   // Continental view
      if (maxSpan > 20) return 4;   // Multi-country view
      if (maxSpan > 10) return 5;   // Country view
      if (maxSpan > 5) return 6;    // Regional view
      if (maxSpan > 2) return 8;    // State view
      return 10;                     // City view
    };

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      const center = getMapCenter();
      const zoom = getZoomLevel();

      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current!.removeLayer(layer);
      }
    });

    // Add markers for events
    events.forEach((event) => {
      if (!event.coordinates || !mapRef.current) return;

      // Check if user can see the address
      const isHost = userId && event.host?.id === userId;
      const currentUserRSVP = userId ? event.rsvps?.find(r => r.userId === userId) : null;
      const isPublicEvent = event.addressVisibility === 'public';
      const showAddress = isHost || currentUserRSVP?.status === 'accepted' || isPublicEvent;

      const marker = L.marker(
        [event.coordinates.lat, event.coordinates.lng],
        { icon: event.type === 'curated' ? purpleIcon : orangeIcon }
      ).addTo(mapRef.current);

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'min-w-[240px]';
      popupContent.innerHTML = `
        <div class="mb-2">
          <span class="inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${
            event.type === 'curated' 
              ? 'text-purple-600 border-purple-600' 
              : 'text-orange-600 border-orange-600'
          }">
            ${event.type === 'curated' ? '🎭 Curated' : '⚡ Spontaneous'}
          </span>
        </div>
        <h3 class="font-semibold mb-2 text-base">${event.title}</h3>
        <div class="space-y-1.5 text-sm text-gray-600 mb-3">
          ${showAddress ? `
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="text-xs">${event.location}</span>
            </div>
          ` : `
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="text-xs text-gray-500">${event.city} (Address hidden)</span>
            </div>
          `}
          <div class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-xs">${format(new Date(event.date.split('T')[0] + 'T' + event.time), 'MMM d, h:mm a')}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span class="text-xs">${event.attendees} going</span>
          </div>
        </div>
      `;

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'flex gap-2';

      // Only show directions button if user can see the address
      if (showAddress) {
        const directionsButton = document.createElement('button');
        directionsButton.className = 'flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors';
        directionsButton.textContent = '🗺️ Directions';
        directionsButton.onclick = (e) => {
          e.stopPropagation();
          const { coordinates, location, city } = event;
          
          if (coordinates) {
            const { lat, lng } = coordinates;
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            
            if (isIOS) {
              window.open(`maps://maps.apple.com/?q=${encodeURIComponent(location)}&ll=${lat},${lng}`, '_blank');
            } else {
              window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
            }
          } else {
            const address = `${location}, ${city}`;
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            
            if (isIOS) {
              window.open(`maps://maps.apple.com/?q=${encodeURIComponent(address)}`, '_blank');
            } else {
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
            }
          }
        };
        buttonContainer.appendChild(directionsButton);
      }

      const detailsButton = document.createElement('button');
      detailsButton.className = `${showAddress ? 'flex-1' : 'w-full'} px-3 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors`;
      detailsButton.textContent = 'View Details';
      detailsButton.onclick = () => navigate(`/event?id=${event.id}`);
      
      buttonContainer.appendChild(detailsButton);
      popupContent.appendChild(buttonContainer);

      marker.bindPopup(popupContent, { maxWidth: 280 });
    });

    // Update map view when events change
    if (events.length > 0) {
      const center = getMapCenter();
      const zoom = getZoomLevel();
      mapRef.current.setView(center, zoom);
    }

    return () => {
      // Cleanup map on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [events, navigate, userId]);

  return (
    <div className="h-[calc(100vh-220px)] w-full relative">
      <div className="absolute top-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <span>Curated Events</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span>Spontaneous</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {events.length} event{events.length !== 1 ? 's' : ''} worldwide
        </div>
      </div>
      
      <div ref={mapContainerRef} className="h-full w-full z-0" />
    </div>
  );
}