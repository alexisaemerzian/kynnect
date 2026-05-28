import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEthnicity } from '../context/EthnicityContext';
import { submitPlace, type PlaceType } from '../../lib/supabasePlaces';

interface SubmitPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ethnicityName: string;
  onPlaceSubmitted?: () => void;
}

export function SubmitPlaceModal({ isOpen, onClose, ethnicityName, onPlaceSubmitted }: SubmitPlaceModalProps) {
  const { user } = useAuth();
  const { selectedEthnicity } = useEthnicity();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'restaurant' as PlaceType,
    city: '',
    address: '',
    description: '',
    phone: '',
    website: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to submit a place');
      return;
    }
    
    if (!selectedEthnicity) {
      toast.error('Please select an ethnicity');
      return;
    }
    
    // Validate required fields
    if (!formData.name || !formData.city || !formData.address || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const { place, error } = await submitPlace(
      {
        name: formData.name,
        type: formData.type,
        city: formData.city,
        address: formData.address,
        description: formData.description,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        imageUrl: formData.imageUrl || undefined,
        ethnicityId: selectedEthnicity.id,
      },
      user.id
    );
    
    if (error) {
      toast.error(error);
      setIsSubmitting(false);
      return;
    }
    
    if (place) {
      toast.success(`${formData.name} submitted for review! We'll add it to the ${ethnicityName} directory soon.`);
      
      // Reset form
      setFormData({
        name: '',
        type: 'restaurant',
        city: '',
        address: '',
        description: '',
        phone: '',
        website: '',
        imageUrl: '',
      });
      
      // Callback to refresh places list
      if (onPlaceSubmitted) {
        onPlaceSubmitted();
      }
      
      onClose();
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Submit a {ethnicityName} Place</DialogTitle>
          <DialogDescription>
            Help grow our {ethnicityName} community directory by adding ethnic-owned businesses, churches, and cultural spaces.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Business Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Raffi's Place"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleChange('type', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">🍽️ Restaurant</SelectItem>
                <SelectItem value="cafe">☕ Cafe</SelectItem>
                <SelectItem value="church">⛪ Church</SelectItem>
                <SelectItem value="bakery">🥐 Bakery</SelectItem>
                <SelectItem value="shop">🛍️ Shop</SelectItem>
                <SelectItem value="other">📍 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              placeholder="e.g., Glendale, CA"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              placeholder="e.g., 211 E Broadway, Glendale, CA 91205"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Tell us what makes this place special..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Phone (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-gray-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., (818) 555-1234"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Website (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-medium">
              Website <span className="text-gray-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="e.g., https://raffisplace.com"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Image URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-medium">
              Image URL <span className="text-gray-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="e.g., https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">Provide a link to a photo of your business</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-black text-white hover:bg-gray-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}