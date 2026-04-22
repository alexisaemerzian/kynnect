import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useEthnicity } from '../context/EthnicityContext';
import { useAuth } from '../context/AuthContext';
import { ethnicities } from '../config/ethnicities';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { PremiumSubscriptionSection } from '../components/PremiumSubscriptionSection';
import { ArrowLeft, Globe2, Check, LogOut, Bell, Megaphone, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const navigate = useNavigate();
  const { selectedEthnicity, setEthnicity } = useEthnicity();
  const { user, logout, updateNotificationPreferences, refreshPremiumStatus } = useAuth();
  const [tempSelection, setTempSelection] = useState(selectedEthnicity?.id);
  
  // Notification preferences state
  const [notificationCity, setNotificationCity] = useState(user?.notificationCity || '');
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [smsNotifications, setSmsNotifications] = useState(user?.smsNotifications ?? true);

  // Check for premium success query parameter
  useEffect(() => {
    const searchParams = window.location.search;
    if (searchParams.includes('premium=success')) {
      // Refresh premium status from database
      refreshPremiumStatus();
      toast.success('🎉 Welcome to Premium! Enjoy your ad-free experience.');
      // Clean up URL
      navigate('/settings', { replace: true });
    }
  }, [refreshPremiumStatus, navigate]);

  const handleSave = () => {
    // Save notification preferences if they've changed
    const notificationChanged = 
      notificationCity !== (user?.notificationCity || '') ||
      emailNotifications !== (user?.emailNotifications ?? true) ||
      smsNotifications !== (user?.smsNotifications ?? true);
    
    if (notificationChanged) {
      updateNotificationPreferences({
        notificationCity,
        emailNotifications,
        smsNotifications
      });
      toast.success('Settings updated successfully');
    }
    
    // Then handle community change if needed
    if (tempSelection && tempSelection !== selectedEthnicity?.id) {
      setEthnicity(tempSelection);
      toast.success('Community changed successfully');
      navigate('/');
    } else if (notificationChanged) {
      navigate(-1);
    } else {
      navigate(-1);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Settings</h1>
              <p className="text-gray-400 text-sm">Manage your preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Notification Preferences */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold">Event Notifications</h2>
              <p className="text-sm text-gray-500">Stay updated about events in your city</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="notificationCity">Preferred City</Label>
              <Input
                id="notificationCity"
                type="text"
                placeholder="e.g. Los Angeles, New York, London"
                value={notificationCity}
                onChange={(e) => setNotificationCity(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">We'll send you updates about events in this city</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailNotifications"
                  checked={emailNotifications}
                  onCheckedChange={(checked) => setEmailNotifications(checked as boolean)}
                />
                <label
                  htmlFor="emailNotifications"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Send me email updates about upcoming events
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smsNotifications"
                  checked={smsNotifications}
                  onCheckedChange={(checked) => setSmsNotifications(checked as boolean)}
                />
                <label
                  htmlFor="smsNotifications"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Send me text messages about upcoming events
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Subscription Section */}
        <PremiumSubscriptionSection />

        {/* Change Community */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold">Change Community</h2>
              <p className="text-sm text-gray-500">Switch to a different ethnicity network</p>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {ethnicities.map((ethnicity) => (
              <button
                key={ethnicity.id}
                onClick={() => setTempSelection(ethnicity.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  tempSelection === ethnicity.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ethnicity.flag}</span>
                  <div className="flex-1">
                    <p className="font-medium">{ethnicity.name}</p>
                    <p className="text-xs text-gray-500">{ethnicity.displayName}</p>
                  </div>
                  {tempSelection === ethnicity.id && (
                    <Check className="w-5 h-5 text-black" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {tempSelection !== selectedEthnicity?.id && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                ⚠️ Changing your community will reload the app and show events and places for the selected ethnicity.
              </p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full h-12 bg-black hover:bg-gray-800"
        >
          Save Changes
        </Button>

        {/* Advertise with Us Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold mb-1">Advertise with Us</h2>
              <p className="text-sm text-gray-700">
                Reach thousands of {selectedEthnicity?.displayName} community members with targeted advertising
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/admin/request-ad')}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Request an Ad
          </Button>
        </div>

        {/* Support Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold mb-1">Need Help?</h2>
              <p className="text-sm text-gray-700">
                Have questions or issues? Contact our support team directly
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/support')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Contact Support
          </Button>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 border-red-300 text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>

        {/* App Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="font-semibold mb-1">Connect - Global Community Network</p>
          <p>Version 1.0.0</p>
          <p className="mt-2">Built to unite communities worldwide</p>
          
          {/* Hidden admin access - only visible to admin email */}
          {user?.email === 'alexisaemerzian@gmail.com' && (
            <button
              onClick={() => navigate('/admin')}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </div>
  );
}