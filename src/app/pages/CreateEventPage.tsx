import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Upload, X, Info, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { BottomNav } from '../components/BottomNav';
import { ImageCropper } from '../components/ImageCropper';
import { useAuth } from '../context/AuthContext';
import { useEthnicity } from '../context/EthnicityContext';
import { useFollow } from '../context/FollowContext';
import { createEvent } from '../../lib/supabaseEvents';
import { notifyFollowersOfNewEvent } from '../../lib/supabaseNotifications';
import { getNotifiableFollowers } from '../../lib/supabaseFollowerPreferences';
import { toast } from 'sonner';

export function CreateEventPage() {
  const navigate = useNavigate();
  const { user, userId } = useAuth();
  const { selectedEthnicity } = useEthnicity();
  const { followers } = useFollow();
  const [eventType, setEventType] = useState<'curated' | 'spontaneous'>('spontaneous');
  const [addressVisibility, setAddressVisibility] = useState<'rsvp_required' | 'public'>('rsvp_required');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image must be less than 5MB');
        return;
      }
      // Open cropper with the selected image
      setTempImageUrl(URL.createObjectURL(file));
      setIsCropping(true);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setImageFile(croppedFile);
    setImagePreview(URL.createObjectURL(croppedFile));
    setIsCropping(false);
    setTempImageUrl(null);
    toast.success('Image adjusted successfully');
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  const editImage = () => {
    if (imagePreview) {
      setTempImageUrl(imagePreview);
      setIsCropping(true);
    }
  };
  
  // Geocode address to get coordinates for map
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      console.log('🗺️ Geocoding address:', address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Kynnect/1.0' // Required by Nominatim
          }
        }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        console.log('✅ Geocoded coordinates:', coords);
        return coords;
      }
      
      console.log('⚠️ No geocoding results found');
      return null;
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      return null;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user || !selectedEthnicity) {
      toast.error('You must be logged in to create an event');
      return;
    }
    
    if (!userId) {
      toast.error('User ID not found. Please log out and log back in.');
      console.error('userId is null or undefined');
      return;
    }
    
    console.log('========================================');
    console.log('🚀 STARTING EVENT CREATION');
    console.log('User ID:', userId);
    console.log('Ethnicity:', selectedEthnicity.name);
    console.log('========================================');
    
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const eventTitle = formData.get('title') as string;
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('❌ Event creation timed out after 30 seconds');
      toast.error('Event creation is taking too long. Please try again.');
      setIsLoading(false);
    }, 30000);
    
    try {
      console.log('📋 Form data:', {
        title: eventTitle,
        description: formData.get('description'),
        type: eventType,
        city: formData.get('city'),
        location: formData.get('location'),
        date: formData.get('date'),
        time: formData.get('time'),
        maxAttendees: formData.get('maxAttendees'),
        hasImage: !!imageFile,
      });
      
      // Geocode the address to get coordinates for the map
      const city = formData.get('city') as string;
      const location = formData.get('location') as string;
      const fullAddress = `${location}, ${city}`;
      const coordinates = await geocodeAddress(fullAddress);
      
      const { event, error } = await createEvent({
        title: eventTitle,
        description: formData.get('description') as string,
        type: eventType,
        city: city,
        location: location,
        date: formData.get('date') as string,
        time: formData.get('time') as string,
        maxAttendees: formData.get('maxAttendees') ? parseInt(formData.get('maxAttendees') as string) : undefined,
        coordinates: coordinates || undefined,
        ethnicityId: selectedEthnicity.id,
        imageFile: imageFile || undefined,
        addressVisibility: user?.isOrganization ? addressVisibility : 'rsvp_required',
      }, userId);
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('❌ Event creation error:', error);
        toast.error(error);
        setIsLoading(false);
        return;
      }
      
      if (event) {
        console.log('✅ Event created successfully:', event.id);

        // Show success immediately
        toast.success('Event created successfully!');

        // Navigate immediately - don't wait for notifications
        console.log('🏠 Navigating to homepage...');
        navigate('/?refresh=' + Date.now());

        // Notify followers asynchronously in the background (fire-and-forget)
        if (followers.length > 0) {
          console.log(`📢 Sending notifications to ${followers.length} followers in background...`);

          // Don't await - let this run in the background
          getNotifiableFollowers(userId, followers)
            .then(({ followerIds: notifiableFollowers }) => {
              if (notifiableFollowers.length > 0) {
                console.log(`📢 Notifying ${notifiableFollowers.length} followers...`);
                return notifyFollowersOfNewEvent(userId, event.id, eventTitle, notifiableFollowers);
              }
            })
            .then((result) => {
              if (result?.success) {
                console.log('✅ Followers notified successfully');
              }
            })
            .catch((error) => {
              console.warn('⚠️ Failed to notify followers (non-critical):', error);
            });
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ Unexpected error creating event:', error);
      toast.error('Failed to create event. Please check your connection and try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-black text-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Create Event</h1>
        </div>
      </div>
      
      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Type */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <Label className="text-base mb-3 block">Event Type</Label>
            <RadioGroup value={eventType} onValueChange={(value) => setEventType(value as any)}>
              <div className="flex items-start space-x-3 mb-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="spontaneous" id="spontaneous" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="spontaneous" className="font-medium cursor-pointer flex items-center gap-2">
                    ⚡ Spontaneous Hang
                  </Label>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Happening now or soon
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="curated" id="curated" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="curated" className="font-medium cursor-pointer flex items-center gap-2">
                    🗓️ Curated Event
                  </Label>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Planned event with details
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          {/* Image Upload */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <Label className="text-base mb-3 block">Event Image (Optional)</Label>
            {!imagePreview ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload event image</p>
                  <p className="text-xs text-gray-400 mt-1">Max 5MB</p>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={editImage}
                    className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input 
                id="title"
                name="title"
                placeholder={eventType === 'spontaneous' ? "e.g., At Philz Coffee rn" : "e.g., Armenian Food Festival"} 
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description"
                name="description"
                placeholder={eventType === 'spontaneous' ? "Quick note about what's happening..." : "Tell people what to expect..."}
                required
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
          
          {/* Location & Time */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 space-y-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input 
                id="city"
                name="city"
                placeholder="e.g., Los Angeles, New York, Boston..."
                required
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">Enter any city - all cities welcome!</p>
            </div>
            
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input 
                id="location"
                name="location"
                placeholder="e.g., Philz Coffee, Glendale" 
                required
                className="mt-1.5"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input 
                  id="date"
                  name="date"
                  type="date" 
                  required
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="time">Time *</Label>
                <Input 
                  id="time"
                  name="time"
                  type="time" 
                  required
                  className="mt-1.5"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
              <Input 
                id="maxAttendees"
                name="maxAttendees"
                type="number" 
                placeholder="Leave empty for unlimited"
                className="mt-1.5"
              />
            </div>
          </div>
          
          {/* Address Visibility (Organizations Only) */}
          {user?.isOrganization && (
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-start gap-2 mb-3">
                <Label className="text-base">Address Visibility</Label>
                <Info className="w-4 h-4 text-gray-400 mt-0.5" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                As an organization, you can choose how people see your event location.
              </p>
              <RadioGroup value={addressVisibility} onValueChange={(value) => setAddressVisibility(value as any)}>
                <div className="flex items-start space-x-3 mb-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-2 border-transparent data-[state=checked]:border-black">
                  <RadioGroupItem value="rsvp_required" id="rsvp_required" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="rsvp_required" className="font-medium cursor-pointer flex items-center gap-2">
                      🔒 RSVP Required
                    </Label>
                    <p className="text-sm text-gray-600 mt-0.5">
                      People must RSVP and get your approval before seeing the exact location
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-2 border-transparent data-[state=checked]:border-black">
                  <RadioGroupItem value="public" id="public" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="public" className="font-medium cursor-pointer flex items-center gap-2">
                      🌍 Public Event
                    </Label>
                    <p className="text-sm text-gray-600 mt-0.5">
                      All {selectedEthnicity?.displayName || 'community'} members can see the exact location. No RSVP needed to view address.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}
          
          {/* Submit */}
          <Button type="submit" className="w-full bg-black hover:bg-gray-800" disabled={isLoading}>
            {isLoading ? 'Creating...' : (eventType === 'spontaneous' ? 'Post Hang' : 'Create Event')}
          </Button>
        </form>
      </div>
      
      <BottomNav />

      {/* Image Cropper Modal */}
      {isCropping && tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}