import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Users, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { supabase } from '../../lib/supabase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onApprove?: () => void;
  onDecline?: () => void;
  showActions?: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  city: string;
  bio: string;
  eventsHosted: number;
  eventsAttended: number;
}

export function UserProfileModal({
  isOpen,
  onClose,
  userId,
  onApprove,
  onDecline,
  showActions = false,
}: UserProfileModalProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile();
    }
  }, [isOpen, userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error loading user:', userError);
        return;
      }

      // Count events hosted
      const { count: hostedCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', userId);

      // Count events attended (accepted RSVPs)
      const { count: attendedCount } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'accepted');

      setUser({
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
        city: userData.city || 'No city set',
        bio: userData.bio || 'No bio yet',
        eventsHosted: hostedCount || 0,
        eventsAttended: attendedCount || 0,
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-purple-500 to-orange-500 h-24"></div>
          <div className="px-6 pb-4">
            <Avatar className="h-24 w-24 border-4 border-white -mt-12 mb-3">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <div className="flex items-center gap-1.5 text-gray-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{user?.city}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">{user?.eventsHosted}</div>
                  <div className="text-xs text-purple-600 mt-1">Events Hosted</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">{user?.eventsAttended}</div>
                  <div className="text-xs text-orange-600 mt-1">Events Attended</div>
                </div>
              </div>

              {/* Bio */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-sm mb-2 text-gray-900">About</h3>
                <p className="text-sm text-gray-700">{user?.bio}</p>
              </div>

              {/* Trust Score (Coming Soon) */}
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-sm text-blue-900">Community Trust</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                      style={{ width: '80%' }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-blue-700">Active Member</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions (only show if approval buttons are needed) */}
        {showActions && !loading && (
          <div className="border-t border-gray-200 p-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => {
                onDecline?.();
                onClose();
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                onApprove?.();
                onClose();
              }}
            >
              ✓ Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
