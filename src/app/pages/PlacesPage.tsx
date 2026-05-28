import { useState, Fragment, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { PlaceCard } from '../components/PlaceCard';
import { NativeAd } from '../components/NativeAd';
import { SubmitPlaceModal } from '../components/SubmitPlaceModal';
import { useEthnicity } from '../context/EthnicityContext';
import { useAuth } from '../context/AuthContext';
import { getPlaces, type Place, type PlaceType } from '../../lib/supabasePlaces';
import { Input } from '../components/ui/input';
import { Search, MapPin, Plus, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export function PlacesPage() {
  const navigate = useNavigate();
  const { selectedEthnicity } = useEthnicity();
  const { user, userId } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PlaceType | 'all'>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Seed places handler
  const handleSeedPlaces = async () => {
    if (!userId) {
      toast.error('Please sign in to seed places');
      return;
    }

    setIsSeeding(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/seed-places`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to seed places');
      }

      const data = await response.json();
      toast.success(`Successfully seeded ${data.successCount} places!`);
      
      // Reload places
      if (selectedEthnicity) {
        const { places: loadedPlaces } = await getPlaces(selectedEthnicity.id);
        if (loadedPlaces) {
          setPlaces(loadedPlaces);
        }
      }
    } catch (error) {
      console.error('Seed error:', error);
      toast.error('Failed to seed places');
    } finally {
      setIsSeeding(false);
    }
  };

  // Load places
  useEffect(() => {
    async function loadPlaces() {
      if (!selectedEthnicity) return;
      
      setIsLoading(true);
      const { places: loadedPlaces, error } = await getPlaces(selectedEthnicity.id, {
        searchQuery: searchQuery || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
      });
      
      if (error) {
        console.error('Error loading places:', error);
        toast.error('Failed to load places');
      } else {
        setPlaces(loadedPlaces);
      }
      
      setIsLoading(false);
    }
    
    loadPlaces();
  }, [selectedEthnicity, searchQuery, selectedType]);

  // Filter places based on search and type (client-side for now)
  const filteredPlaces = places.filter(place => {
    const matchesSearch = !searchQuery || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || place.type === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  // Group places by city
  const placesByCity = filteredPlaces.reduce((acc, place) => {
    if (!acc[place.city]) {
      acc[place.city] = [];
    }
    acc[place.city].push(place);
    return acc;
  }, {} as Record<string, Place[]>);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold mb-1">{selectedEthnicity?.placesTitle}</h1>
              <p className="text-gray-400 text-sm">{selectedEthnicity?.placesDescription}</p>
            </div>
            <button
              onClick={() => {
                if (!user) {
                  toast.error('Please sign in to submit a place');
                  return;
                }
                setIsSubmitModalOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium whitespace-nowrap ml-3"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Submit Place</span>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search places or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[140px] z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                selectedType === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('restaurant')}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                selectedType === 'restaurant'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🍽️ Restaurants
            </button>
            <button
              onClick={() => setSelectedType('cafe')}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                selectedType === 'cafe'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ☕ Cafes
            </button>
            <button
              onClick={() => setSelectedType('church')}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                selectedType === 'church'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⛪ Churches
            </button>
            <button
              onClick={() => setSelectedType('bakery')}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                selectedType === 'bakery'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🥐 Bakeries
            </button>
            <button
              onClick={() => setSelectedType('shop')}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                selectedType === 'shop'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🛍️ Shops
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Promote Your Business Banner */}
        <div 
          onClick={() => navigate('/request-ad')}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 mb-6 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold mb-1">Promote Your Business</h2>
              <p className="text-sm text-gray-700 mb-2">
                Reach thousands of {selectedEthnicity?.displayName} community members with targeted advertising
              </p>
              <div className="text-sm font-medium text-purple-700">
                Request an Ad →
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <p>Loading places...</p>
          </div>
        ) : Object.keys(placesByCity).length > 0 ? (
          Object.entries(placesByCity).map(([city, places], cityIndex) => (
            <div key={city} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold">{city}</h2>
                <span className="text-sm text-gray-500">({places.length})</span>
              </div>
              
              <div className="space-y-4">
                {places.map((place, index) => (
                  <Fragment key={`place-${place.id}-${index}`}>
                    <PlaceCard place={place} />
                    {/* Show ad after every 5th place in each city */}
                    {(index + 1) % 5 === 0 && index !== places.length - 1 && (
                      <NativeAd variant="places" />
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No places found.</p>
            <p className="text-sm mt-1">Try a different search or filter, or be the first to submit one!</p>
            {places.length === 0 && !searchQuery && selectedType === 'all' && (
              <button
                onClick={handleSeedPlaces}
                disabled={isSeeding}
                className="mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSeeding ? 'Seeding Places...' : '🌱 Seed Sample Places'}
              </button>
            )}
          </div>
        )}
      </div>
      
      <BottomNav />
      <SubmitPlaceModal 
        isOpen={isSubmitModalOpen} 
        onClose={() => setIsSubmitModalOpen(false)} 
        ethnicityName={selectedEthnicity?.name || 'Community'}
        onPlaceSubmitted={() => {
          // Reload places after submission
          if (selectedEthnicity) {
            getPlaces(selectedEthnicity.id).then(({ places: loadedPlaces }) => {
              if (loadedPlaces) {
                setPlaces(loadedPlaces);
              }
            });
          }
        }}
      />
    </div>
  );
}