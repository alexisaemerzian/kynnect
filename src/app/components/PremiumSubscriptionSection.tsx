import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Crown, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface PremiumStatus {
  isPremium: boolean;
  status?: string;
  subscriptionId?: string;
  startedAt?: string;
  currentPeriodEnd?: string;
}

export function PremiumSubscriptionSection() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch premium status
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchPremiumStatus = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/premium-status/${userId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPremiumStatus(data);
        }
      } catch (error) {
        console.error('Error fetching premium status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPremiumStatus();
  }, [userId]);

  const handleCancelSubscription = async () => {
    setIsProcessingCancel(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/cancel-subscription`,
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
        throw new Error('Failed to cancel subscription');
      }

      const data = await response.json();
      toast.success(data.message || 'Subscription canceled successfully');

      // Refresh premium status
      const statusResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/premium-status/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (statusResponse.ok) {
        const newStatus = await statusResponse.json();
        setPremiumStatus(newStatus);
      }

      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsProcessingCancel(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Premium Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (!premiumStatus?.isPremium) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Premium Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Upgrade to Premium for an ad-free experience and exclusive features.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>No ads</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Premium badge</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Early access to new features</span>
            </div>
            <Button
              onClick={() => navigate('/premium-upgrade')}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
            >
              Upgrade for $4.99/month
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isActive = premiumStatus.status === 'active';
  const isCanceling = premiumStatus.status === 'canceling';
  const nextBillingDate = premiumStatus.currentPeriodEnd
    ? new Date(premiumStatus.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <>
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Premium Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                {isActive ? 'Active' : isCanceling ? 'Canceling' : premiumStatus.status}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">Premium ($4.99/month)</span>
              </div>
              {nextBillingDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {isCanceling ? 'Access until:' : 'Next billing:'}
                  </span>
                  <span className="font-medium">{nextBillingDate}</span>
                </div>
              )}
            </div>

            {isCanceling && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-orange-800">
                  Your subscription will be canceled at the end of the billing period. 
                  You'll continue to have premium access until then.
                </p>
              </div>
            )}

            {isActive && (
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Premium Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will be canceled at the end of the current billing period.
              You'll continue to have premium access until {nextBillingDate}.
              <br /><br />
              You can resubscribe at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessingCancel}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isProcessingCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessingCancel ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Yes, Cancel'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
