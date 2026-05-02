import { type Place, type PlaceType } from '../../lib/supabasePlaces';
import { MapPin, Phone } from 'lucide-react';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router';

interface PlaceCardProps {
  place: Place;
}

const typeIcons: Record<PlaceType, string> = {
  restaurant: '🍽️',
  cafe: '☕',
  church: '⛪',
  bakery: '🥐',
  shop: '🛍️',
  other: '📍',
};

const typeColors: Record<PlaceType, string> = {
  restaurant: 'border-orange-300 text-orange-700 bg-orange-50',
  cafe: 'border-amber-300 text-amber-700 bg-amber-50',
  church: 'border-purple-300 text-purple-700 bg-purple-50',
  bakery: 'border-pink-300 text-pink-700 bg-pink-50',
  shop: 'border-blue-300 text-blue-700 bg-blue-50',
  other: 'border-gray-300 text-gray-700 bg-gray-50',
};

export function PlaceCard({ place }: PlaceCardProps) {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => navigate(`/places/${place.id}`)}
      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all p-4 cursor-pointer h-[140px] flex flex-col"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg line-clamp-1">{place.name}</h3>
        <Badge variant="outline" className={`${typeColors[place.type]} flex-shrink-0 ml-2`}>
          {typeIcons[place.type]} {place.type}
        </Badge>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{place.description}</p>
      
      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{place.address}</span>
        </div>
        
        {place.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{place.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}