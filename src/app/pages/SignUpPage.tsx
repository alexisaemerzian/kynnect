import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Bell, Building2, Eye, EyeOff } from 'lucide-react';
import { useEthnicity } from '../context/EthnicityContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { signUp } from '../../lib/supabaseAuth';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

export function SignUpPage() {
  const navigate = useNavigate();
  const { selectedEthnicity, availableEthnicities } = useEthnicity();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<'individual' | 'organization'>('individual');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [notificationCity, setNotificationCity] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  
  // Organization fields
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('');
  const [organizationWebsite, setOrganizationWebsite] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [organizationLocation, setOrganizationLocation] = useState('');
  
  const sendWelcomeMessages = (userData: { name: string; email: string; phone: string; emailNotifications: boolean; smsNotifications: boolean }) => {
    const displayName = selectedEthnicity?.displayName || 'Community';
    const greeting = selectedEthnicity?.greeting || 'Welcome!';
    const flag = selectedEthnicity?.flag || '🌍';
    const isOrg = accountType === 'organization';
    
    // Send email notification (simulated)
    if (userData.emailNotifications && userData.email) {
      setTimeout(() => {
        toast.success(
          <div className="flex flex-col gap-1">
            <div className="font-semibold">📧 Welcome Email Sent!</div>
            <div className="text-sm text-gray-600">
              Sent to: {userData.email}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              "{greeting} {userData.name}! Welcome to {displayName} {flag}. Discover events, connect with your community, and explore culture worldwide."
            </div>
          </div>,
          { duration: 6000 }
        );
      }, 500);
    }
    
    // Send SMS notification (simulated)
    if (userData.smsNotifications && userData.phone) {
      setTimeout(() => {
        toast.success(
          <div className="flex flex-col gap-1">
            <div className="font-semibold">📱 Welcome Text Sent!</div>
            <div className="text-sm text-gray-600">
              Sent to: {userData.phone}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              "{greeting}! Welcome to {displayName} {flag}. {isOrg ? 'Start creating events for your community!' : 'Start discovering events near you!'} Reply STOP to unsubscribe."
            </div>
          </div>,
          { duration: 6000 }
        );
      }, 1200);
    }
    
    // Confirmation toast
    setTimeout(() => {
      const messagesSent = [];
      if (userData.emailNotifications) messagesSent.push('email');
      if (userData.smsNotifications) messagesSent.push('SMS');
      
      if (messagesSent.length > 0) {
        toast.info(
          `✅ ${messagesSent.join(' and ')} welcome messages sent successfully!`,
          { duration: 4000 }
        );
      }
    }, 2000);
  };
  
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    
    // Validate age is 21+
    if (parseInt(age) < 21) {
      toast.error('You must be 21 or older to join.');
      return;
    }
    
    setLoading(true);
    
    // Check if this will be an additional account
    const { data: existingProfiles } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);
    
    const accountCount = existingProfiles?.length || 0;
    const isAdditionalAccount = accountCount > 0;
    
    if (isAdditionalAccount) {
      toast.info(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Creating Additional Account...</div>
          <div className="text-sm">
            Account #{accountCount + 1} for {email}
          </div>
        </div>,
        { duration: 3000 }
      );
    }
    
    try {
      const userData = {
        name,
        phone,
        age,
        notificationCity,
        emailNotifications,
        smsNotifications,
        isOrganization: accountType === 'organization',
        organizationName: accountType === 'organization' ? organizationName : undefined,
        organizationType: accountType === 'organization' ? organizationType : undefined,
        organizationWebsite: accountType === 'organization' ? organizationWebsite : undefined,
        organizationDescription: accountType === 'organization' ? organizationDescription : undefined,
        organizationLocation: accountType === 'organization' ? organizationLocation : undefined,
        availableEthnicities: availableEthnicities.length > 0 ? availableEthnicities : [selectedEthnicity?.id],
      };
      
      // Create account in Supabase
      const result = await signUp(email, password, userData);
      
      if (!result.success) {
        // Check if it's a max accounts error
        if (result.error?.includes('Maximum of 5 accounts')) {
          toast.error(
            <div className="flex flex-col gap-1">
              <div className="font-semibold">Account Limit Reached</div>
              <div className="text-sm">
                You've already created 5 accounts with this email. Please use a different email address or delete an existing account.
              </div>
            </div>,
            { duration: 6000 }
          );
        } else {
          toast.error(result.error || 'Failed to create account. Please try again.');
        }
        setLoading(false);
        return;
      }
      
      // Show info if this is a secondary account
      if (isAdditionalAccount) {
        toast.info(
          <div className="flex flex-col gap-1">
            <div className="font-semibold">Additional Account Created! 🎉</div>
            <div className="text-sm">
              You can now manage multiple profiles (personal, organization, etc.) with the same email.
            </div>
          </div>,
          { duration: 5000 }
        );
      }
      
      // Send automated welcome messages
      sendWelcomeMessages({ ...userData, email });
      
      // Auto-login the user
      console.log('🔄 Attempting auto-login after signup...');
      const loginResult = await login(email, password);

      console.log('Login result:', loginResult);

      if (loginResult.success) {
        console.log('✅ Auto-login successful!');
        toast.success(`Welcome to ${selectedEthnicity?.displayName || 'Kynnect'}! 🎉`);
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      } else {
        console.error('❌ Auto-login failed:', loginResult.error);
        toast.info('Account created! Please log in with your credentials.');
        navigate('/login', { replace: true });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get ethnicity-specific styling
  const primaryColor = selectedEthnicity?.primaryColor || '#7c3aed';
  const secondaryColor = selectedEthnicity?.secondaryColor || '#ec4899';
  const greeting = selectedEthnicity?.greeting || 'Welcome!';
  const displayName = selectedEthnicity?.displayName || 'Community';
  const flag = selectedEthnicity?.flag || '🌍';
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <span className="text-3xl">{flag}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{greeting}</h1>
          <p className="text-white/90">Welcome to {displayName}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Create Your Account</h2>
            <p className="text-gray-600 text-sm">
              Connect with your community around the world. Browse events, discover places, and build connections.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              💡 You can create up to 5 accounts with the same email and phone number (e.g., for different ethnicities or organizations)
            </p>
          </div>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">We'll use this for event notifications</p>
            </div>
            
            <div>
              <Label htmlFor="age">Age</Label>
              <Input 
                id="age"
                type="number"
                placeholder="Must be 21+"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min="21"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">You must be 21+ to join</p>
            </div>
            
            {/* Account Type */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Account Type</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="individual"
                    checked={accountType === 'individual'}
                    onCheckedChange={(checked) => setAccountType(checked ? 'individual' : 'organization')}
                  />
                  <label
                    htmlFor="individual"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Individual
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="organization"
                    checked={accountType === 'organization'}
                    onCheckedChange={(checked) => setAccountType(checked ? 'organization' : 'individual')}
                  />
                  <label
                    htmlFor="organization"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Organization
                  </label>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                Choose whether you're joining as an individual or representing an organization
              </p>
            </div>
            
            {/* Organization Details */}
            {accountType === 'organization' && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Organization Details</h3>
                </div>
                
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input 
                    id="organizationName"
                    type="text"
                    placeholder="Enter your organization's name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="organizationType">Organization Type</Label>
                  <Input 
                    id="organizationType"
                    type="text"
                    placeholder="e.g. Non-profit, Cultural Group"
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="organizationWebsite">Organization Website</Label>
                  <Input 
                    id="organizationWebsite"
                    type="url"
                    placeholder="https://www.example.com"
                    value={organizationWebsite}
                    onChange={(e) => setOrganizationWebsite(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="organizationDescription">Organization Description</Label>
                  <Input 
                    id="organizationDescription"
                    type="text"
                    placeholder="Brief description of your organization"
                    value={organizationDescription}
                    onChange={(e) => setOrganizationDescription(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="organizationLocation">Organization Location</Label>
                  <Input 
                    id="organizationLocation"
                    type="text"
                    placeholder="e.g. New York, London"
                    value={organizationLocation}
                    onChange={(e) => setOrganizationLocation(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}
            
            {/* Notification Preferences */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Event Notifications</h3>
              </div>
              
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
                <p className="text-xs text-gray-500 mt-1">Get notified about events in your city</p>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={(checked) => setEmailNotifications(checked as boolean)}
                  />
                  <label
                    htmlFor="emailNotifications"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Send me text messages about upcoming events
                  </label>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                You can change these preferences anytime in settings
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full text-white"
              style={{ backgroundColor: primaryColor }}
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Community'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Browse events, connect with your community,</p>
            <p className="mt-1">and discover culture worldwide.</p>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')} 
              className="font-semibold underline hover:text-gray-900"
            >
              Log in
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center text-white/80 text-sm">
          <p>Find your culture. Find your people. Anywhere. (21+)</p>
        </div>
      </div>
    </div>
  );
}