import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useEthnicity } from '../context/EthnicityContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Megaphone, Upload, DollarSign, Target } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { unsplash_tool } from '../../utils/unsplash';

export function RequestAdPage() {
  const navigate = useNavigate();
  const { selectedEthnicity } = useEthnicity();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    businessName: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    adTitle: '',
    adDescription: '',
    targetCity: '',
    ctaText: '',
    ctaUrl: '',
    imageUrl: '',
    budget: '',
    additionalInfo: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to submit an ad request');
      navigate('/login');
      return;
    }
    
    // Validation
    if (!formData.businessName || !formData.adTitle || !formData.adDescription || 
        !formData.ctaText || !formData.ctaUrl || !formData.contactEmail) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Submit ad request to server
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-026f502c/ad-requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            ...formData,
            ethnicityId: selectedEthnicity?.id,
            userId: user.id,
            status: 'pending',
          }),
        }
      );
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      toast.success('Ad request submitted successfully! We\'ll review it and contact you soon.');
      navigate('/');
    } catch (error) {
      console.error('Error submitting ad request:', error);
      toast.error('Failed to submit ad request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Request an Ad</h1>
              <p className="text-gray-400 text-sm">Promote your business to the community</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold mb-1">Native Advertising</h2>
              <p className="text-sm text-gray-700">
                Your ad will be shown to {selectedEthnicity?.displayName} community members in targeted cities. 
                We'll review your request and contact you within 24-48 hours with pricing and placement options.
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Business Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Your business or organization name"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Ad Content */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Ad Content</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="adTitle">Ad Title *</Label>
                <Input
                  id="adTitle"
                  type="text"
                  placeholder="e.g., Fresh Mediterranean Cuisine in Glendale"
                  value={formData.adTitle}
                  onChange={(e) => handleChange('adTitle', e.target.value)}
                  required
                  className="mt-1.5"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.adTitle.length}/60 characters</p>
              </div>
              
              <div>
                <Label htmlFor="adDescription">Ad Description *</Label>
                <Textarea
                  id="adDescription"
                  placeholder="Describe your business and what makes it special..."
                  value={formData.adDescription}
                  onChange={(e) => handleChange('adDescription', e.target.value)}
                  required
                  className="mt-1.5 min-h-[100px]"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.adDescription.length}/200 characters</p>
              </div>
              
              <div>
                <Label htmlFor="imageUrl">Ad Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 1200x630px or 16:9 ratio
                </p>
                
                {imagePreview && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                    <ImageWithFallback
                      src={imagePreview}
                      alt="Ad preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ctaText">Call-to-Action Text *</Label>
                  <Input
                    id="ctaText"
                    type="text"
                    placeholder="e.g., Visit Website, Order Now"
                    value={formData.ctaText}
                    onChange={(e) => handleChange('ctaText', e.target.value)}
                    required
                    className="mt-1.5"
                    maxLength={20}
                  />
                </div>
                
                <div>
                  <Label htmlFor="ctaUrl">Call-to-Action URL *</Label>
                  <Input
                    id="ctaUrl"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={formData.ctaUrl}
                    onChange={(e) => handleChange('ctaUrl', e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Targeting */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Targeting</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="targetCity">Target City (Optional)</Label>
                <Input
                  id="targetCity"
                  type="text"
                  placeholder="e.g., Los Angeles, Glendale, Burbank"
                  value={formData.targetCity}
                  onChange={(e) => handleChange('targetCity', e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to show to all {selectedEthnicity?.displayName} users
                </p>
              </div>
              
              <div>
                <Label htmlFor="budget">Estimated Monthly Budget</Label>
                <div className="relative mt-1.5">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="budget"
                    type="text"
                    placeholder="500"
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This helps us recommend the best package for you
                </p>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Additional Information</h3>
            
            <div>
              <Label htmlFor="additionalInfo">Anything else we should know?</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Special requirements, campaign goals, timeline, etc."
                value={formData.additionalInfo}
                onChange={(e) => handleChange('additionalInfo', e.target.value)}
                className="mt-1.5 min-h-[80px]"
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Ad Request'}
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            By submitting, you agree that we may contact you about your advertising request. 
            No payment is required at this time.
          </p>
        </form>
      </div>
    </div>
  );
}
