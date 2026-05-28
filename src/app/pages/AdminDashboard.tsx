import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useEthnicity } from '../context/EthnicityContext';
import { getAdminAnalytics, getEventPromotions, approveEventPromotion, rejectEventPromotion, getAds, getAdRequests, approveAdRequest, rejectAdRequest, createAd } from '../../lib/supabaseAdmin';
import { getPendingPlaces, moderatePlace } from '../../lib/supabasePlaces';
import type { EventPromotion, Ad } from '../../lib/supabaseAdmin';
import type { Place } from '../../lib/supabasePlaces';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {
  Users,
  Calendar,
  MapPin,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Check,
  X,
  Eye,
  MousePointerClick,
  Plus,
  Lock,
  MessageCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const ADMIN_PASSCODE = 'Giacoletti64!';

const ETHNICITIES = [
  { id: 'armenian', name: 'Armenian', flag: '🇦🇲' },
  { id: 'greek', name: 'Greek', flag: '🇬🇷' },
  { id: 'italian', name: 'Italian', flag: '🇮🇹' },
  { id: 'mexican', name: 'Mexican', flag: '🇲🇽' },
  { id: 'irish', name: 'Irish', flag: '🇮🇪' },
  { id: 'polish', name: 'Polish', flag: '🇵🇱' },
  { id: 'lebanese', name: 'Lebanese', flag: '🇱🇧' },
  { id: 'korean', name: 'Korean', flag: '🇰🇷' },
  { id: 'jewish', name: 'Jewish', flag: '🇮🇱' },
  { id: 'filipino', name: 'Filipino', flag: '🇵🇭' },
  { id: 'nigerian', name: 'Nigerian', flag: '🇳🇬' },
  { id: 'chinese', name: 'Chinese', flag: '🇨🇳' },
  { id: 'indian', name: 'Indian', flag: '🇮🇳' },
  { id: 'brazilian', name: 'Brazilian', flag: '🇧🇷' },
  { id: 'persian', name: 'Persian', flag: '🇮🇷' },
];

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isPasscodeVerified, setIsPasscodeVerified] = useState(false);
  const [selectedEthnicityTab, setSelectedEthnicityTab] = useState('armenian');
  
  // Analytics by ethnicity
  const [ethnicityAnalytics, setEthnicityAnalytics] = useState<Record<string, any>>({});
  const [ethnicityPendingPlaces, setEthnicityPendingPlaces] = useState<Record<string, Place[]>>({});
  
  const [pendingPromotions, setPendingPromotions] = useState<EventPromotion[]>([]);
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [adRequests, setAdRequests] = useState<any[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [isCreateAdOpen, setIsCreateAdOpen] = useState(false);
  const [newAdData, setNewAdData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    sponsorName: '',
    ctaText: '',
    ctaUrl: '',
    adType: 'main' as 'main' | 'local',
    city: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  
  // Comments management
  const [allComments, setAllComments] = useState<any[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  
  // Check if user is admin (only alexisaemerzian@gmail.com)
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access admin dashboard');
      navigate('/login');
      return;
    }
    
    // Only allow specific email to access admin
    if (user.email !== 'alexisaemerzian@gmail.com') {
      toast.error('Access denied: Admin privileges required');
      navigate('/');
      return;
    }
    
    setIsAdmin(true);
    setIsLoading(false);
  }, [user, navigate]);
  
  // Handle passcode verification
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === ADMIN_PASSCODE) {
      setIsPasscodeVerified(true);
      toast.success('Access granted!');
    } else {
      toast.error('Incorrect passcode');
      setPasscodeInput('');
    }
  };
  
  // Load analytics
  useEffect(() => {
    async function loadAnalytics() {
      if (!isAdmin) return;
      
      const analyticsPromises = ETHNICITIES.map(async (ethnicity) => {
        const { analytics: data, error } = await getAdminAnalytics(ethnicity.id);
        
        if (error) {
          console.error('Error loading analytics:', error);
        } else if (data) {
          setEthnicityAnalytics(prev => ({
            ...prev,
            [ethnicity.id]: data,
          }));
        }
      });
      
      await Promise.all(analyticsPromises);
    }
    
    loadAnalytics();
  }, [isAdmin]);
  
  // Load pending promotions
  useEffect(() => {
    async function loadPendingPromotions() {
      if (!isAdmin) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-026f502c/event-promotions?status=pending`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load promotions');
        }

        const data = await response.json();
        setPendingPromotions(data.promotions || []);
      } catch (error) {
        console.error('Error loading promotions:', error);
      }
    }

    loadPendingPromotions();
  }, [isAdmin]);
  
  // Load pending places
  useEffect(() => {
    async function loadPendingPlaces() {
      if (!isAdmin) return;
      
      const placesPromises = ETHNICITIES.map(async (ethnicity) => {
        console.log('🔍 Loading pending places for ethnicity:', ethnicity.id);
        const { places, error } = await getPendingPlaces(ethnicity.id);
        
        if (error) {
          console.error('Error loading pending places:', error);
          toast.error('Failed to load pending places');
        } else {
          console.log('✅ Loaded pending places:', places);
          setEthnicityPendingPlaces(prev => ({
            ...prev,
            [ethnicity.id]: places,
          }));
        }
      });
      
      await Promise.all(placesPromises);
    }
    
    loadPendingPlaces();
  }, [isAdmin]);
  
  // Load active ads
  useEffect(() => {
    async function loadActiveAds() {
      if (!isAdmin) return;
      
      const adsPromises = ETHNICITIES.map(async (ethnicity) => {
        const { ads, error } = await getAds({
          ethnicityId: ethnicity.id,
          status: 'active',
        });
        
        if (error) {
          console.error('Error loading ads:', error);
        } else {
          setActiveAds(prev => [
            ...prev,
            ...ads.map(ad => ({ ...ad, ethnicityId: ethnicity.id })),
          ]);
        }
      });
      
      await Promise.all(adsPromises);
    }
    
    loadActiveAds();
  }, [isAdmin]);
  
  // Load ad requests
  useEffect(() => {
    async function loadAdRequests() {
      if (!isAdmin) return;
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-026f502c/ad-requests?status=pending`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to load ad requests');
        }
        
        const data = await response.json();
        setAdRequests(data.requests || []);
      } catch (error) {
        console.error('Error loading ad requests:', error);
      }
    }
    
    loadAdRequests();
  }, [isAdmin]);
  
  // Load all comments
  useEffect(() => {
    async function loadAllComments() {
      if (!isAdmin || !isPasscodeVerified) return;
      
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/admin/comments`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to load comments');
        }
        
        const data = await response.json();
        setAllComments(data.comments || []);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
    
    loadAllComments();
  }, [isAdmin, isPasscodeVerified]);
  
  // Handle update comment
  const handleUpdateComment = async () => {
    if (!user || !editingCommentId || !editingCommentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    setIsUpdatingComment(true);
    try {
      const comment = allComments.find(c => c.id === editingCommentId);
      if (!comment) {
        toast.error('Comment not found');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/places/${comment.placeId}/comments/${editingCommentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId: user.id,
            userName: user.name,
            comment: editingCommentText.trim(),
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update comment');
      }
      
      const data = await response.json();
      setAllComments(allComments.map(c => c.id === editingCommentId ? data.comment : c));
      setEditingCommentId(null);
      setEditingCommentText('');
      toast.success('Comment updated!');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setIsUpdatingComment(false);
    }
  };
  
  // Handle delete comment
  const handleDeleteComment = async (commentId: string, placeId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-026f502c/places/${placeId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      setAllComments(allComments.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };
  
  // Handle promotion approval
  const handleApprovePromotion = async (promotionId: string) => {
    if (!user) return;
    
    const { success, error } = await approveEventPromotion(promotionId, user.id, 7);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Event promotion approved!');
      setPendingPromotions(prev => prev.filter(p => p.id !== promotionId));
      const ethnicityId = promotionId.split('-')[0];
      setEthnicityAnalytics(prev => ({
        ...prev,
        [ethnicityId]: {
          ...prev[ethnicityId],
          pendingPromotions: prev[ethnicityId].pendingPromotions - 1,
        },
      }));
    }
  };
  
  // Handle promotion rejection
  const handleRejectPromotion = async (promotionId: string) => {
    if (!user) return;
    
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    const { success, error } = await rejectEventPromotion(promotionId, user.id, rejectReason);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Event promotion rejected');
      setPendingPromotions(prev => prev.filter(p => p.id !== promotionId));
      setRejectReason('');
      const ethnicityId = promotionId.split('-')[0];
      setEthnicityAnalytics(prev => ({
        ...prev,
        [ethnicityId]: {
          ...prev[ethnicityId],
          pendingPromotions: prev[ethnicityId].pendingPromotions - 1,
        },
      }));
    }
  };
  
  // Handle place moderation
  const handleModeratePlace = async (placeId: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    
    const { success, error } = await moderatePlace(placeId, status, user.id);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success(`Place ${status}!`);
      const ethnicityId = placeId.split('-')[0];
      setEthnicityPendingPlaces(prev => ({
        ...prev,
        [ethnicityId]: prev[ethnicityId].filter(p => p.id !== placeId),
      }));
      setEthnicityAnalytics(prev => ({
        ...prev,
        [ethnicityId]: {
          ...prev[ethnicityId],
          pendingPlaces: prev[ethnicityId].pendingPlaces - 1,
        },
      }));
    }
  };
  
  // Handle creating a new ad
  const handleCreateAd = async () => {
    if (!user || !selectedEthnicityTab) return;
    
    // Validation
    if (!newAdData.title.trim()) {
      toast.error('Please enter an ad title');
      return;
    }
    if (!newAdData.description.trim()) {
      toast.error('Please enter an ad description');
      return;
    }
    if (!newAdData.imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }
    if (!newAdData.sponsorName.trim()) {
      toast.error('Please enter a sponsor name');
      return;
    }
    if (!newAdData.ctaText.trim()) {
      toast.error('Please enter a call-to-action text');
      return;
    }
    if (!newAdData.ctaUrl.trim()) {
      toast.error('Please enter a call-to-action URL');
      return;
    }
    if (newAdData.adType === 'local' && !newAdData.city.trim()) {
      toast.error('Please enter a city for local ads');
      return;
    }
    if (!newAdData.endDate) {
      toast.error('Please select an end date');
      return;
    }
    
    const { ad, error } = await createAd(
      {
        title: newAdData.title,
        description: newAdData.description,
        imageUrl: newAdData.imageUrl,
        sponsorName: newAdData.sponsorName,
        ctaText: newAdData.ctaText,
        ctaUrl: newAdData.ctaUrl,
        ethnicityId: selectedEthnicityTab,
        city: newAdData.adType === 'local' ? newAdData.city : undefined,
        adType: newAdData.adType,
        startDate: newAdData.startDate,
        endDate: newAdData.endDate,
      },
      user.id
    );
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Ad created successfully!');
      setIsCreateAdOpen(false);
      // Reset form
      setNewAdData({
        title: '',
        description: '',
        imageUrl: '',
        sponsorName: '',
        ctaText: '',
        ctaUrl: '',
        adType: 'main',
        city: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
      // Reload ads
      const { ads } = await getAds({ ethnicityId: selectedEthnicityTab, status: 'active' });
      if (ads) setActiveAds(ads);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Verifying admin access...</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null;
  }
  
  // Passcode Protection Screen
  if (!isPasscodeVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Enter the passcode to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <Label htmlFor="passcode">Passcode</Label>
                <Input
                  id="passcode"
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter passcode"
                  className="mt-1.5"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800"
              >
                Unlock Admin Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">
                Kynnect Platform Administration
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Back to App
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Ethnicity Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Community</CardTitle>
            <CardDescription>
              View analytics and manage content for each ethnicity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {ETHNICITIES.map((ethnicity) => (
                <Button
                  key={ethnicity.id}
                  onClick={() => setSelectedEthnicityTab(ethnicity.id)}
                  variant={selectedEthnicityTab === ethnicity.id ? 'default' : 'outline'}
                  className={`h-auto py-3 flex flex-col items-center gap-2 ${
                    selectedEthnicityTab === ethnicity.id
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{ethnicity.flag}</span>
                  <span className="text-sm font-medium">{ethnicity.name}</span>
                  {ethnicityPendingPlaces[ethnicity.id]?.length > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {ethnicityPendingPlaces[ethnicity.id].length} pending
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs */}
        <Tabs defaultValue="promotions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="promotions">
              Event Promotions
              {ethnicityAnalytics[selectedEthnicityTab]?.pendingPromotions > 0 && (
                <Badge className="ml-2 bg-red-500">{ethnicityAnalytics[selectedEthnicityTab]?.pendingPromotions}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="places">
              Places
              {ethnicityAnalytics[selectedEthnicityTab]?.pendingPlaces > 0 && (
                <Badge className="ml-2 bg-red-500">{ethnicityAnalytics[selectedEthnicityTab]?.pendingPlaces}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ad-requests">
              Ad Requests
              {adRequests.length > 0 && (
                <Badge className="ml-2 bg-red-500">{adRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ads">
              Ads ({ethnicityAnalytics[selectedEthnicityTab]?.totalAds || 0})
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageCircle className="w-4 h-4 mr-1 inline" />
              Comments ({allComments.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">
              Analytics
            </TabsTrigger>
          </TabsList>
          
          {/* Event Promotions Tab */}
          <TabsContent value="promotions">
            <Card>
              <CardHeader>
                <CardTitle>Pending Event Promotions</CardTitle>
                <CardDescription>
                  Review and approve event promotion requests from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingPromotions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending promotions</p>
                ) : (
                  <div className="space-y-4">
                    {pendingPromotions.map(promotion => (
                      <div
                        key={promotion.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{promotion.event?.title}</h3>
                            <p className="text-sm text-gray-600">
                              by {promotion.user?.name} ({promotion.user?.email})
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            {promotion.package}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Package:</span>{' '}
                            <span className="font-medium capitalize">{promotion.package}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Price:</span>{' '}
                            <span className="font-medium">${promotion.price}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Requested:</span>{' '}
                            <span className="font-medium">
                              {formatDistanceToNow(new Date(promotion.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprovePromotion(promotion.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve (7 days)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleRejectPromotion(promotion.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Places Tab */}
          <TabsContent value="places">
            <Card>
              <CardHeader>
                <CardTitle>Pending Places</CardTitle>
                <CardDescription>
                  Review and approve place submissions from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ethnicityPendingPlaces[selectedEthnicityTab]?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending places</p>
                ) : (
                  <div className="space-y-4">
                    {ethnicityPendingPlaces[selectedEthnicityTab]?.map(place => (
                      <div
                        key={place.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{place.name}</h3>
                            <p className="text-sm text-gray-600">
                              {place.city} • {place.type}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {place.submittedBy?.name}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{place.description}</p>
                        <p className="text-xs text-gray-500 mb-4">
                          📍 {place.address}
                          {place.phone && ` • 📞 ${place.phone}`}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleModeratePlace(place.id, 'approved')}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleModeratePlace(place.id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Ad Requests Tab */}
          <TabsContent value="ad-requests">
            <Card>
              <CardHeader>
                <CardTitle>Pending Ad Requests</CardTitle>
                <CardDescription>
                  Review advertising requests from businesses and organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending ad requests</p>
                ) : (
                  <div className="space-y-4">
                    {adRequests.map(request => (
                      <div
                        key={request.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{request.adTitle}</h3>
                            <p className="text-sm text-gray-600">
                              {request.businessName}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {request.budget ? `$${request.budget}/mo` : 'Budget TBD'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{request.adDescription}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3 bg-gray-50 p-3 rounded">
                          <div>
                            <span className="text-gray-500">Contact:</span>{' '}
                            <span className="font-medium">{request.contactEmail}</span>
                          </div>
                          {request.contactPhone && (
                            <div>
                              <span className="text-gray-500">Phone:</span>{' '}
                              <span className="font-medium">{request.contactPhone}</span>
                            </div>
                          )}
                          {request.targetCity && (
                            <div>
                              <span className="text-gray-500">Target City:</span>{' '}
                              <span className="font-medium">{request.targetCity}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">CTA:</span>{' '}
                            <span className="font-medium">{request.ctaText}</span>
                          </div>
                        </div>
                        
                        {request.ctaUrl && (
                          <div className="text-xs text-gray-500 mb-2">
                            🔗 <a href={request.ctaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{request.ctaUrl}</a>
                          </div>
                        )}
                        
                        {request.additionalInfo && (
                          <div className="text-sm text-gray-600 mb-3 italic">
                            "{request.additionalInfo}"
                          </div>
                        )}
                        
                        {request.imageUrl && (
                          <div className="mb-3">
                            <img
                              src={request.imageUrl}
                              alt={request.adTitle}
                              className="w-full max-w-md h-40 object-cover rounded border"
                            />
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-400 mb-3">
                          Submitted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => window.open(`mailto:${request.contactEmail}?subject=Re: Ad Request for ${request.businessName}`, '_blank')}
                          >
                            📧 Contact Advertiser
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300"
                            onClick={async () => {
                              try {
                                await fetch(
                                  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-026f502c/ad-requests/${request.id}`,
                                  {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                                    },
                                    body: JSON.stringify({ status: 'reviewed' }),
                                  }
                                );
                                setAdRequests(prev => prev.filter(r => r.id !== request.id));
                                toast.success('Ad request marked as reviewed');
                              } catch (error) {
                                toast.error('Failed to update request');
                              }
                            }}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Mark as Reviewed
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Ads Tab */}
          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Ads</CardTitle>
                    <CardDescription>
                      Manage native advertising campaigns
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsCreateAdOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Ad
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeAds.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No active ads</p>
                    <Button
                      onClick={() => setIsCreateAdOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Ad
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeAds.map(ad => (
                      <div
                        key={ad.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {ad.imageUrl && (
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className="w-24 h-24 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{ad.title}</h3>
                                <p className="text-sm text-gray-600">{ad.sponsorName}</p>
                              </div>
                              <Badge variant="outline" className={ad.adType === 'main' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                                {ad.adType === 'main' ? '🌍 Universal' : `📍 ${ad.city}`}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{ad.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {ad.impressions} impressions
                              </div>
                              <div className="flex items-center gap-1">
                                <MousePointerClick className="w-3 h-3" />
                                {ad.clicks} clicks
                              </div>
                              <div>
                                CTR: {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0}%
                              </div>
                            </div>
                            {(ad.startDate || ad.endDate) && (
                              <div className="text-xs text-gray-500">
                                {ad.startDate && `📅 Starts: ${new Date(ad.startDate).toLocaleDateString()}`}
                                {ad.startDate && ad.endDate && ' • '}
                                {ad.endDate && `⏰ Expires: ${new Date(ad.endDate).toLocaleDateString()}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>Manage Comments</CardTitle>
                <CardDescription>
                  Edit or delete comments from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allComments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No comments to manage</p>
                ) : (
                  <div className="space-y-4">
                    {allComments.map(comment => (
                      <div
                        key={comment.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{comment.userName}</h3>
                            <p className="text-sm text-gray-600">
                              {comment.placeName}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'N/A'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{comment.comment}</p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditingCommentText(comment.comment);
                            }}
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteComment(comment.id, comment.placeId)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users:</span>
                    <span className="font-semibold">{ethnicityAnalytics[selectedEthnicityTab]?.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Events:</span>
                    <span className="font-semibold">{ethnicityAnalytics[selectedEthnicityTab]?.totalEvents || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Places:</span>
                    <span className="font-semibold">{ethnicityAnalytics[selectedEthnicityTab]?.totalPlaces || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Ads:</span>
                    <span className="font-semibold">{ethnicityAnalytics[selectedEthnicityTab]?.totalAds || 0}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month:</span>
                    <span className="font-semibold text-green-600">${ethnicityAnalytics[selectedEthnicityTab]?.revenueThisMonth || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Promotions:</span>
                    <span className="font-semibold">{ethnicityAnalytics[selectedEthnicityTab]?.totalPromotions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Promotions:</span>
                    <span className="font-semibold text-yellow-600">{ethnicityAnalytics[selectedEthnicityTab]?.pendingPromotions || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create Ad Dialog */}
      <Dialog open={isCreateAdOpen} onOpenChange={setIsCreateAdOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Advertisement</DialogTitle>
            <DialogDescription>
              Add a purchased ad campaign. Set start and end dates for automatic scheduling.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Ad Title */}
            <div>
              <Label htmlFor="ad-title">Ad Title *</Label>
              <Input
                id="ad-title"
                value={newAdData.title}
                onChange={(e) => setNewAdData({ ...newAdData, title: e.target.value })}
                placeholder="e.g., Nike - Just Do It"
                className="mt-1.5"
              />
            </div>
            
            {/* Sponsor Name */}
            <div>
              <Label htmlFor="sponsor-name">Sponsor Name *</Label>
              <Input
                id="sponsor-name"
                value={newAdData.sponsorName}
                onChange={(e) => setNewAdData({ ...newAdData, sponsorName: e.target.value })}
                placeholder="e.g., Nike"
                className="mt-1.5"
              />
            </div>
            
            {/* Description */}
            <div>
              <Label htmlFor="ad-description">Description *</Label>
              <Textarea
                id="ad-description"
                value={newAdData.description}
                onChange={(e) => setNewAdData({ ...newAdData, description: e.target.value })}
                placeholder="Ad copy that will appear on the feed..."
                className="mt-1.5"
                rows={3}
              />
            </div>
            
            {/* Image URL */}
            <div>
              <Label htmlFor="image-url">Image URL *</Label>
              <Input
                id="image-url"
                value={newAdData.imageUrl}
                onChange={(e) => setNewAdData({ ...newAdData, imageUrl: e.target.value })}
                placeholder="https://example.com/ad-image.jpg"
                className="mt-1.5"
              />
              {newAdData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={newAdData.imageUrl}
                    alt="Ad preview"
                    className="w-full h-40 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Call-to-Action */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cta-text">CTA Text *</Label>
                <Input
                  id="cta-text"
                  value={newAdData.ctaText}
                  onChange={(e) => setNewAdData({ ...newAdData, ctaText: e.target.value })}
                  placeholder="e.g., Shop Now"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="cta-url">CTA URL *</Label>
                <Input
                  id="cta-url"
                  value={newAdData.ctaUrl}
                  onChange={(e) => setNewAdData({ ...newAdData, ctaUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="mt-1.5"
                />
              </div>
            </div>
            
            {/* Ad Type */}
            <div>
              <Label>Ad Type *</Label>
              <RadioGroup
                value={newAdData.adType}
                onValueChange={(value: 'main' | 'local') => setNewAdData({ ...newAdData, adType: value, city: value === 'main' ? '' : newAdData.city })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="main" id="main-ad" />
                  <Label htmlFor="main-ad" className="font-normal cursor-pointer">
                    🌍 Universal Ad (Shows to all ethnicities)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="local" id="local-ad" />
                  <Label htmlFor="local-ad" className="font-normal cursor-pointer">
                    📍 Local Ad (City-specific)
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* City (conditional) */}
            {newAdData.adType === 'local' && (
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={newAdData.city}
                  onChange={(e) => setNewAdData({ ...newAdData, city: e.target.value })}
                  placeholder="e.g., Los Angeles"
                  className="mt-1.5"
                />
              </div>
            )}
            
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newAdData.startDate}
                  onChange={(e) => setNewAdData({ ...newAdData, startDate: e.target.value })}
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">When ad starts showing</p>
              </div>
              <div>
                <Label htmlFor="end-date">End Date *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newAdData.endDate}
                  onChange={(e) => setNewAdData({ ...newAdData, endDate: e.target.value })}
                  min={newAdData.startDate}
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">When ad expires (auto)</p>
              </div>
            </div>
            
            {/* Info Box */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <AlertCircle className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">Automatic Scheduling</p>
                <p>This ad will automatically start showing on the start date and stop showing after the end date. No manual intervention needed!</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateAdOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAd}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Create Ad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Comment Dialog */}
      <Dialog open={editingCommentId !== null} onOpenChange={(open) => {  
        if (!open) {
          setEditingCommentId(null);
          setEditingCommentText('');
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Comment</DialogTitle>
            <DialogDescription>
              Update the comment text
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={editingCommentText}
              onChange={(e) => setEditingCommentText(e.target.value)}
              placeholder="Comment text..."
              rows={4}
              className="w-full"
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingCommentId(null);
                setEditingCommentText('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateComment}
              disabled={!editingCommentText.trim() || isUpdatingComment}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdatingComment ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}