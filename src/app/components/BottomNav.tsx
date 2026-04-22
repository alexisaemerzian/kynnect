import { Home, PlusCircle, User, MapPin, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUnreadMessageCount, subscribeToConversations } from '../../lib/supabaseMessages';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);
  
  const isActive = (path: string) => location.pathname === path;
  
  // Load unread count
  useEffect(() => {
    async function loadUnreadCount() {
      if (!user) {
        setTotalUnread(0);
        return;
      }
      
      const { count } = await getUnreadMessageCount(user.id);
      setTotalUnread(count);
    }
    
    loadUnreadCount();
  }, [user]);
  
  // Subscribe to real-time updates for unread count
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToConversations(user.id, async () => {
      const { count } = await getUnreadMessageCount(user.id);
      setTotalUnread(count);
    });
    
    return () => {
      unsubscribe();
    };
  }, [user]);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/') ? 'text-black' : 'text-gray-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">Events</span>
        </button>
        
        <button
          onClick={() => navigate('/places')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/places') ? 'text-black' : 'text-gray-400'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-xs mt-1">Places</span>
        </button>
        
        <button
          onClick={() => navigate('/create')}
          className="flex flex-col items-center justify-center -mt-6"
        >
          <div className="bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-800 transition-colors">
            <PlusCircle className="w-6 h-6" />
          </div>
        </button>
        
        <button
          onClick={() => navigate('/messages')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
            isActive('/messages') || location.pathname.startsWith('/messages/') ? 'text-black' : 'text-gray-400'
          }`}
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </div>
          <span className="text-xs mt-1">Messages</span>
        </button>
        
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/profile') ? 'text-black' : 'text-gray-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
}