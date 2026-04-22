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
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const { conversations: loadedConvs, error: loadError } = await getConversations(user.id);

        if (loadError) {
          console.error('Error loading conversations:', loadError);
          setError(loadError);
          toast.error('Failed to load conversations');
        } else {
          // Filter out any conversations with missing data
          const validConversations = loadedConvs.filter(conv => conv.otherUser);
          setConversations(validConversations);

          if (validConversations.length < loadedConvs.length) {
            console.warn(`Filtered out ${loadedConvs.length - validConversations.length} conversations with missing user data`);
          }
        }
      } catch (err) {
        console.error('Unexpected error loading conversations:', err);
        setError('An unexpected error occurred');
        toast.error('An unexpected error occurred');
      }

      setIsLoading(false);
    }

    loadConversations();
  }, [user]);
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToConversations(user.id, async () => {
      // Reload conversations when any update happens
      const { conversations: loadedConvs, error } = await getConversations(user.id);
      if (!error) {
        setConversations(loadedConvs);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [user]);
  
  if (!user) {
    return null;
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
            <p className="text-red-600 text-center font-semibold mb-2">Unable to load messages</p>
            <p className="text-gray-500 text-sm text-center mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-gray-300"
            >
              Try Again
            </Button>
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