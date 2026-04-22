import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useEthnicity } from '../context/EthnicityContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Check, ArrowLeft, Sparkles, X, Zap, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function PremiumUpgradePage() {
  const navigate = useNavigate();
  const { user, userId } = useAuth();
  const { selectedEthnicity } = useEthnicity();
  const [isLoading, setIsLoading] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<any>(null);

  const handleUpgrade = async () => {
    if (!userId) {
      toast.error('Please sign in to upgrade');
      navigate('/auth/login');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Starting premium upgrade for user:', userId);

      // Call server to create Stripe checkout session
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      console.log('📡 Checkout response status:', response.status);

      const data = await response.json();
      console.log('📦 Checkout response data:', data);

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to create checkout session';
        console.error('❌ Checkout error:', errorMsg);
        throw new Error(errorMsg);
      }

      if (!data.checkoutUrl) {
        console.error('❌ No checkout URL in response:', data);
        throw new Error('No checkout URL received');
      }

      console.log('✅ Redirecting to Stripe checkout:', data.checkoutUrl);

      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('❌ Upgrade error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout';
      toast.error(errorMessage + ' - Please contact support if this persists.');
      setIsLoading(false);
    }
  };

  const checkStripeStatus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/stripe/status`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setStripeStatus(data);
      console.log('🔍 Stripe status:', data);

      if (!data.configured) {
        toast.error('Stripe is not configured. Please contact support.');
      } else {
        toast.success('Stripe is properly configured!');
      }
    } catch (error) {
      console.error('Error checking Stripe status:', error);
      toast.error('Failed to check payment configuration');
    }
  };

  const premiumFeatures = [
    { icon: X, text: 'Ad-free experience', highlight: true },
    { icon: Zap, text: 'Early access to new features' },
    { icon: Crown, text: 'Exclusive premium badge on your profile' },
    { icon: Sparkles, text: 'Priority event listings' },
    { icon: Check, text: 'Support the community' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Upgrade to Premium</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero Card */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-100 to-orange-100 mb-8">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {selectedEthnicity?.displayName} Premium
            </h2>
            <p className="text-gray-700 mb-6">
              Get the best experience while supporting the {selectedEthnicity?.name} community
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-6">
              <span className="text-4xl font-bold">$4.99</span>
              <span className="text-gray-600">/month</span>
            </div>
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full max-w-md mx-auto bg-black text-white hover:bg-gray-800 h-12 text-base font-semibold"
            >
              {isLoading ? 'Loading...' : 'Start Premium Membership'}
            </Button>
            <p className="text-xs text-gray-600 mt-4">
              Cancel anytime. No commitments.
            </p>

            {/* Debug button - always available for now to help with setup */}
            <div className="mt-4">
              <Button
                onClick={checkStripeStatus}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Check Payment Configuration
              </Button>
            </div>

            {stripeStatus && !stripeStatus.configured && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm font-semibold text-red-900 mb-1">⚠️ Payment System Not Configured</p>
                <p className="text-xs text-red-700">
                  Stripe payment processing is not set up. Please contact support to enable premium subscriptions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Premium Benefits</h3>
          <div className="space-y-3">
            {premiumFeatures.map((feature, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      feature.highlight 
                        ? 'bg-gradient-to-br from-purple-600 to-orange-500' 
                        : 'bg-black'
                    }`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-medium">{feature.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-1">Can I cancel anytime?</p>
                <p className="text-gray-600">
                  Yes! You can cancel your premium membership at any time from your settings. 
                  You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">How do I remove ads?</p>
                <p className="text-gray-600">
                  Once you upgrade to premium, all ads will be automatically hidden from your experience.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">What payment methods do you accept?</p>
                <p className="text-gray-600">
                  We accept all major credit cards, debit cards, and digital wallets through our secure payment processor Stripe.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
