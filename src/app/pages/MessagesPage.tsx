import { useState, useEffect } from 'react';
import { BottomNav } from '../components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getConversations, subscribeToConversations, type Conversation } from '../../lib/supabaseMessages';
import { toast } from 'sonner';

export function MessagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  
  // Load conversations
  useEffect(() => {
    async function loadConversations() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { conversations: loadedConvs, error: loadError } = await getConversations(user.id);

        if (loadError) {
          console.error('Error loading conversations:', loadError);
          // Check if it's a table doesn't exist error
          if (loadError.includes('relation') || loadError.includes('does not exist') || loadError.includes('table')) {
            setError('Messages feature not yet set up. Please contact support to enable messaging.');
          } else {
            setError(loadError);
          }
        } else {
          // Filter out any conversations with missing data
          const validConversations = loadedConvs.filter(conv => conv.otherUser);
          setConversations(validConversations);

          if (validConversations.length < loadedConvs.length) {
            console.warn(`Filtered out ${loadedConvs.length - validConversations.length} conversations with missing user data`);
          }
        }
      } catch (err: any) {
        console.error('Unexpected error loading conversations:', err);
        const errorMsg = err?.message || 'An unexpected error occurred';
        if (errorMsg.includes('relation') || errorMsg.includes('does not exist') || errorMsg.includes('table')) {
          setError('Messages feature not yet set up. Please contact support to enable messaging.');
        } else {
          setError(errorMsg);
        }
      }

      setIsLoading(false);
    }

    loadConversations();
  }, [user]);
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!user || error) return;

    try {
      const unsubscribe = subscribeToConversations(user.id, async () => {
        const { conversations: loadedConvs, error } = await getConversations(user.id);
        if (!error) {
          setConversations(loadedConvs);
        }
      });

      return () => {
        try {
          unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      };
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
    }
  }, [user, error]);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view messages</p>
          <Button onClick={() => navigate('/login')} className="bg-black hover:bg-gray-800">
            Log In
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Messages</h1>
              {totalUnread > 0 && (
                <p className="text-gray-400 text-sm">{totalUnread} unread</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-2xl mx-auto">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-900 text-center font-semibold mb-2">Messages Not Available</p>
            <p className="text-gray-600 text-sm text-center mb-4 max-w-md">
              {error.includes('not yet set up')
                ? 'The messaging feature needs to be configured in your database. Please run the setup SQL script in Supabase.'
                : error
              }
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-gray-300"
              >
                Go Home
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-black hover:bg-gray-800"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <p className="text-gray-500 text-center">No messages yet</p>
            <p className="text-gray-400 text-sm text-center mt-2">
              Start a conversation by messaging an event host or attendee
            </p>
          </div>
        ) : (
          <div className="bg-white border-b border-gray-200">
            {conversations.map((conversation) => {
              // Skip conversations where other user is missing
              if (!conversation.otherUser) {
                console.warn('Skipping conversation with missing otherUser:', conversation.id);
                return null;
              }

              return (
                <div
                  key={conversation.id}
                  onClick={() => navigate(`/messages/${conversation.id}`)}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={conversation.otherUser.avatar} />
                    <AvatarFallback>{conversation.otherUser.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{conversation.otherUser.name}</h3>
                        <p className="text-xs text-gray-500">{conversation.otherUser.city || 'Unknown'}</p>
                      </div>
                      {conversation.lastMessageTime && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    {conversation.eventTitle && (
                      <Badge variant="outline" className="mb-2 text-xs bg-purple-50 border-purple-200 text-purple-700">
                        📅 {conversation.eventTitle}
                      </Badge>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate flex-1 ${conversation.unreadCount && conversation.unreadCount > 0 ? 'font-semibold text-black' : 'text-gray-600'}`}>
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <Badge className="bg-black text-white flex-shrink-0">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}