import { Event } from '../types';

/**
 * Opens the location in the device's default maps application
 * Uses coordinates if available, otherwise falls back to address search
 */
export function openInMaps(event: Event) {
  const { coordinates, location, city, address } = event;
  
  // If we have coordinates, use them for precise location
  if (coordinates) {
    const { lat, lng } = coordinates;
    
    // Detect if user is on iOS (will open Apple Maps) or other (will open Google Maps)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Apple Maps URL with coordinates
      window.open(`maps://maps.apple.com/?q=${encodeURIComponent(location)}&ll=${lat},${lng}`, '_blank');
    } else {
      // Google Maps URL with coordinates
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  } else {
    // Fallback to address search if no coordinates
    // Prefer specific address if available, otherwise use location + city
    const searchAddress = address || `${location}, ${city || ''}`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(`maps://maps.apple.com/?q=${encodeURIComponent(searchAddress)}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchAddress)}`, '_blank');
    }
  }
}