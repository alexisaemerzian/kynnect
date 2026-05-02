import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { MapPin, ArrowLeft, Calendar, Users, UserPlus, UserCheck, UserMinus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { getFollowerDetails } from '../../lib/supabaseFollows';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  ethnicity_id: string;
  city: string;
  bio: string;
  avatar_url: string;
  is_organization: boolean;
  organization_name?: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  city: string;
  image_url: string;
}

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFollowing, followUser, unfollowUser, getFollowStatus, followers, following } = useFollow();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followStatus, setFollowStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [mutualFollowers, setMutualFollowers] = useState<Array<{ id: string; name: string; avatar?: string }>>([]);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadFollowStatus();
      loadMutualFollowers();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error loading user:', userError);
        toast.error('Failed to load user profile');
        return;
      }

      setProfile(userData);

      // Load hosted events
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, date, city, image_url')
        .eq('created_by_id', userId)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3);

      setHostedEvents(eventsData || []);

      // Load attending events
      const { data: rsvpsData } = await supabase
        .from('rsvps')
        .select('event_id, events(id, title, date, city, image_url)')
        .eq('user_id', userId)
        .eq('status', 'accepted');

      const attendingEventsData = rsvpsData
        ?.map(r => r.events as unknown as Event)
        .filter(e => e && new Date(e.date) >= new Date())
        .slice(0, 3) || [];

      setAttendingEvents(attendingEventsData);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFollowStatus = async () => {
    if (!userId || !user) return;
    const status = await getFollowStatus(userId);
    setFollowStatus(status);
  };

  const loadMutualFollowers = async () => {
    if (!userId || !user) return;

    try {
      // Get followers of the profile user
      const { followers: profileFollowers } = await getFollowerDetails(userId);

      // Get followers of current user
      const { followers: myFollowers } = await getFollowerDetails(user.id);

      // Find mutual followers (people who follow both)
      const mutual = profileFollowers.filter(pf =>
        myFollowers.some(mf => mf.id === pf.id)
      );

      setMutualFollowers(mutual);
    } catch (error) {
      console.error('Error loading mutual followers:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!userId || !user) return;

    try {
      if (followStatus === 'accepted') {
        await unfollowUser(userId);
        setFollowStatus('none');
        toast.success('Unfollowed successfully');
      } else if (followStatus === 'pending') {
        await unfollowUser(userId);
        setFollowStatus('none');
        toast.success('Follow request cancelled');
      } else {
        await followUser(userId);
        setFollowStatus('pending');
        toast.success('Follow request sent');
      }
      loadMutualFollowers();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} />
                <AvatarFallback>{profile.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
                {profile.is_organization && profile.organization_name && (
                  <Badge variant="outline" className="mb-2 bg-purple-50 border-purple-300 text-purple-700">
                    Organization
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.city || 'No city set'}</span>
                </div>

                {!isOwnProfile && user && (
                  <Button
                    onClick={handleFollowToggle}
                    variant={followStatus === 'accepted' ? 'outline' : 'default'}
                    className={followStatus === 'accepted' ? 'border-gray-300' : 'bg-black hover:bg-gray-800'}
                  >
                    {followStatus === 'accepted' ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Following
                      </>
                    ) : followStatus === 'pending' ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Cancel Request
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mutual Followers */}
        {mutualFollowers.length > 0 && !isOwnProfile && (
          <Card className="mb-6 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">
                  {mutualFollowers.length} Mutual {mutualFollowers.length === 1 ? 'Follower' : 'Followers'}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {mutualFollowers.slice(0, 5).map((follower) => (
                  <div
                    key={follower.id}
                    className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 border border-blue-200"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={follower.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${follower.name}`} />
                      <AvatarFallback className="text-xs">{follower.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900">{follower.name}</span>
                  </div>
                ))}
                {mutualFollowers.length > 5 && (
                  <div className="flex items-center px-3 py-1.5 text-sm text-blue-700 font-medium">
                    +{mutualFollowers.length - 5} more
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hosted Events */}
        {hostedEvents.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Hosting ({hostedEvents.length})</h2>
            <div className="space-y-3">
              {hostedEvents.map((event) => (
                <Card
                  key={event.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/event?id=${event.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {event.image_url && (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{event.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{event.city}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Attending Events */}
        {attendingEvents.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Attending ({attendingEvents.length})</h2>
            <div className="space-y-3">
              {attendingEvents.map((event) => (
                <Card
                  key={event.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/event?id=${event.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {event.image_url && (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{event.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{event.city}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {hostedEvents.length === 0 && attendingEvents.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No upcoming events yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
