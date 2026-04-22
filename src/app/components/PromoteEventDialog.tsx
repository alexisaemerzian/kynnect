import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup } from './ui/radio-group';
import { TrendingUp, Check } from 'lucide-react';
import { useEthnicity } from '../context/EthnicityContext';
import { useAuth } from '../context/AuthContext';
import { createEventPromotion, type PromotionPackage } from '../../lib/supabaseAdmin';
import { toast } from 'sonner';

interface PromoteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
}

const promotionPackages = [
  {
    id: '3-day',
    name: '3-Day Boost',
    duration: 3,
    price: 15,
    features: [
      'Featured placement in feed',
      'Promoted badge',
      '3x more visibility'
    ]
  },
  {
    id: '7-day',
    name: '7-Day Featured',
    duration: 7,
    price: 35,
    features: [
      'Featured placement in feed',
      'Promoted badge',
      'Email notification to subscribers',
      '5x more visibility'
    ],
    popular: true
  },
  {
    id: '14-day',
    name: '14-Day Premium',
    duration: 14,
    price: 60,
    features: [
      'Featured placement in feed',
      'Promoted badge',
      'Email notification to subscribers',
      'SMS notification to subscribers',
      '10x more visibility'
    ]
  }
];

export function PromoteEventDialog({ 
  open, 
  onOpenChange, 
  eventId, 
  eventTitle 
}: PromoteEventDialogProps) {
  const [selectedPackage, setSelectedPackage] = useState(promotionPackages[1].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedEthnicity } = useEthnicity();
  const { user } = useAuth();

  const selectedPkg = promotionPackages.find(p => p.id === selectedPackage)!;

  const handleSubmit = async () => {
    if (!user || !selectedEthnicity) return;

    console.log('🚀 [PromoteEvent] Starting submission...');
    console.log('🚀 [PromoteEvent] User:', user.id);
    console.log('🚀 [PromoteEvent] Event:', eventId);
    console.log('🚀 [PromoteEvent] Package:', selectedPkg);

    setIsSubmitting(true);

    const { promotion, error } = await createEventPromotion(
      {
        eventId,
        package: selectedPkg.id as PromotionPackage,
        price: selectedPkg.price,
      },
      user.id
    );

    console.log('🚀 [PromoteEvent] Result:', { promotion, error });

    if (error) {
      console.error('❌ [PromoteEvent] Error:', error);
      toast.error(error);
      setIsSubmitting(false);
      return;
    }

    if (promotion) {
      console.log('✅ [PromoteEvent] Success!');
      toast.success('Promotion request submitted! We\'ll review it shortly.');
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Promote Your Event
          </DialogTitle>
          <DialogDescription>
            Boost visibility and reach more people in your community
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Event:</span> {eventTitle}
            </p>
          </div>

          <Label className="text-base mb-3 block">Choose a Promotion Package</Label>
          
          <div className="space-y-3">
            {promotionPackages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                disabled={isSubmitting}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedPackage === pkg.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      {pkg.popular && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                    <ul className="space-y-1">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold">${pkg.price}</div>
                    <div className="text-xs text-gray-500">{pkg.duration}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-black text-white hover:bg-gray-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : `Submit Request - $${selectedPkg.price}`}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            💡 Payment will be processed after admin approval. You can track your request status in your profile.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}