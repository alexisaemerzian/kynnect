import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export function EditEventPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        toast.error('Invalid event ID');
        navigate('/');
        return;
      }
      
      try {
        setIsLoading(true);
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events/${eventId}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to load event');
        }
        
        const data = await response.json();
        const event = data.event;
        
        // Check if user is the host
        if (event.host.id !== user?.id) {
          toast.error('You can only edit your own events');
          navigate(`/event?id=${eventId}`);
          return;
        }
        
        // Populate form
        setTitle(event.title);
        setDescription(event.description);
        setLocation(event.location);
        setCity(event.city || '');
        
        // Parse date and time if available
        if (event.time) {
          const dateOnly = event.date.split('T')[0];
          setDate(dateOnly);
          setTime(event.time);
        } else {
          // For spontaneous events with human-readable dates
          setDate(event.date);
          setTime('');
        }
      } catch (error) {
        console.error('Error loading event:', error);
        toast.error('Failed to load event');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvent();
  }, [eventId, user, navigate]);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventId || !user) {
      toast.error('Unable to save changes');
      return;
    }
    
    if (!title.trim() || !description.trim() || !location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events/${eventId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          userId: user.id,
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          city: city.trim(),
          date,
          time,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update event');
      }
      
      toast.success('Event updated successfully!');
      navigate(`/event?id=${eventId}`);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update event');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!eventId || !user) {
      toast.error('Unable to delete event');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/events/${eventId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete event');
      }
      
      toast.success('Event deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete event');
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/event?id=${eventId}`)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Edit Event</h1>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSave} className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Event Title *
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Sunday BBQ in the Park"
            required
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description *
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell people what to expect..."
            rows={4}
            required
          />
        </div>
        
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2">
            Location Address *
          </label>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., 123 Main St, Los Angeles, CA"
            required
          />
        </div>
        
        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-2">
            City
          </label>
          <Input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Los Angeles"
          />
        </div>
        
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-2">
              Date
            </label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium mb-2">
              Time
            </label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>
        
        {/* Save Button */}
        <Button
          type="submit"
          className="w-full bg-black hover:bg-gray-800"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Changes...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        
        {/* Delete Event */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Danger Zone</p>
          <Button
            type="button"
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Event
          </Button>
        </div>
      </form>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-3">Delete Event?</h2>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All RSVPs and comments will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Event'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
