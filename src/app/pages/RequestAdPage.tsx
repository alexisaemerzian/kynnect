import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useEthnicity } from '../context/EthnicityContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Slider } from '../components/ui/slider';
import { ArrowLeft, Megaphone, DollarSign, Target, CreditCard, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { supabase } from '../../lib/supabase';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

// Payment form component
function PaymentForm({
  amount,
  onSuccess
}: {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm the payment (creates authorization hold)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'requires_capture') {
        toast.success('Payment authorized! Submitting your ad request...');
        onSuccess(paymentIntent.id);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
      >
        {isProcessing ? 'Authorizing Payment...' : `Authorize Payment ($${amount})`}
      </Button>
      <p className="text-xs text-center text-gray-500 mt-2">
        Your card will be authorized but NOT charged until your ad is approved by our team.
      </p>
    </form>
  );
}

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
    budget: '',
    additionalInfo: '',
    amount: '100', // Default ad amount
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Image cropping state
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas size to the cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Read the file and show crop dialog
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result as string);
      setShowCropDialog(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      // Get cropped image as blob
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Convert blob to file
      const croppedFile = new File([croppedBlob], 'ad-image.jpg', { type: 'image/jpeg' });
      setImageFile(croppedFile);

      // Create preview from blob
      const previewUrl = URL.createObjectURL(croppedBlob);
      setImagePreview(previewUrl);

      setShowCropDialog(false);
      setImageSrc(null);
      toast.success('Image cropped successfully!');
    } catch (error) {
      console.error('Crop error:', error);
      toast.error('Failed to crop image');
    }
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
        !formData.ctaText || !formData.ctaUrl || !formData.contactEmail || !formData.amount) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    console.log('🔄 Creating payment intent...');

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      // Create payment intent (authorization only, not charged yet)
      const paymentResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-026f502c/ad-requests/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount: parseFloat(formData.amount),
            currency: 'usd',
            customerEmail: formData.contactEmail,
            description: `Ad Request: ${formData.adTitle}`,
            metadata: {
              businessName: formData.businessName,
              ethnicityId: selectedEthnicity?.id || '',
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log('📥 Payment response status:', paymentResponse.status);

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('❌ Payment intent error:', errorText);
        throw new Error(`Failed to create payment intent: ${errorText}`);
      }

      const responseData = await paymentResponse.json();
      console.log('✅ Payment intent created:', responseData);

      const { clientSecret: secret } = responseData;

      if (!secret) {
        throw new Error('No client secret returned from server');
      }

      setClientSecret(secret);
      setShowPayment(true);
      setIsSubmitting(false);
    } catch (error: any) {
      console.error('❌ Error creating payment intent:', error);

      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please check your connection and try again.');
      } else {
        toast.error(error.message || 'Failed to initialize payment. Please try again.');
      }

      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (intentId: string) => {
    setPaymentIntentId(intentId);
    setIsSubmitting(true);

    try {
      // Upload image if provided
      let imageUrl = '';
      if (imageFile) {
        console.log('📤 Uploading ad image...');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `ad-${user!.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('make-026f502c-event-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('⚠️ Image upload error:', uploadError);
          toast.warning('Image upload failed, continuing without image');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('make-026f502c-event-images')
            .getPublicUrl(fileName);

          imageUrl = publicUrl;
          console.log('✅ Image uploaded successfully:', imageUrl);
        }
      }

      // Submit ad request with payment intent ID
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
            imageUrl,
            ethnicityId: selectedEthnicity?.id,
            userId: user!.id,
            status: 'pending',
            paymentIntentId: intentId,
            amount: parseFloat(formData.amount),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success('Ad request submitted! Your card is authorized but won\'t be charged until we approve your ad.');
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
                <Label htmlFor="imageFile">Ad Image</Label>
                <div className="mt-1.5">
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 1200x630px or 16:9 ratio • Max 5MB
                </p>

                {imagePreview && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                    <img
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
                <Label htmlFor="amount">Ad Payment Amount *</Label>
                <div className="relative mt-1.5">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    className="pl-9"
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Amount to authorize. Your card will NOT be charged until your ad is approved.
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
          
          {/* Payment Section */}
          {showPayment && clientSecret ? (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Authorization
              </h3>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  💳 Authorization Hold - Your card will NOT be charged yet
                </p>
                <p className="text-xs text-blue-700">
                  We'll place a temporary hold of <strong>${formData.amount}</strong> on your card.
                  The charge will only be captured after our team reviews and approves your ad request.
                  If rejected, the hold will be automatically released.
                </p>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  amount={parseFloat(formData.amount)}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPayment(false);
                  setClientSecret(null);
                }}
                className="w-full mt-3"
              >
                Go Back to Form
              </Button>
            </div>
          ) : (
            <>
              {/* Submit Button */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    // Skip payment and submit directly (for testing)
                    setIsSubmitting(true);
                    try {
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
                            imageUrl: '',
                            ethnicityId: selectedEthnicity?.id,
                            userId: user!.id,
                            status: 'pending',
                            paymentIntentId: null,
                            amount: parseFloat(formData.amount),
                          }),
                        }
                      );

                      if (response.ok) {
                        toast.success('Ad request submitted without payment (testing mode)');
                        navigate('/');
                      } else {
                        toast.error('Failed to submit');
                      }
                    } catch (error) {
                      toast.error('Error submitting request');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Skip Payment (Testing)
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Next step: Authorize payment (your card won't be charged until we approve your ad)
                </p>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crop Your Ad Image</DialogTitle>
            <DialogDescription>
              Drag to reposition and use the slider to zoom. Recommended: 16:9 ratio (1200x630px)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Cropper Area */}
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  cropShape="rect"
                  showGrid={true}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>

            {/* Zoom Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <ZoomOut className="w-4 h-4" />
                  Zoom
                </span>
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-4 h-4" />
                </span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={([value]) => setZoom(value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 text-center">
                Drag the image to reposition • Use slider to zoom
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCropDialog(false);
                setImageSrc(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleCropSave}
            >
              Save Cropped Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
