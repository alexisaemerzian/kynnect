import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import {
  getConversationById,
  sendMessage,
  markMessagesAsRead,
  subscribeToConversation,
  type Conversation,
  type Message,
} from '../../lib/supabaseMessages';
import { toast } from 'sonner';

export function ConversationPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Load conversation
  useEffect(() => {
    async function loadConversation() {
      if (!conversationId || !user) return;
      
      setIsLoading(true);
      const { conversation: loadedConv, error } = await getConversationById(conversationId, user.id);
      
      if (error) {
        console.error('Error loading conversation:', error);
        toast.error('Failed to load conversation');
        setIsLoading(false);
        return;
      }
      
      if (loadedConv) {
        setConversation(loadedConv);
        setMessages(loadedConv.messages || []);
        
        // Mark messages as read
        await markMessagesAsRead(conversationId, user.id);
      }
      
      setIsLoading(false);
    }
    
    loadConversation();
  }, [conversationId, user]);
  
  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId || !user) return;
    
    const unsubscribe = subscribeToConversation(
      conversationId,
      (newMessage: Message) => {
        // Add new message to list
        setMessages(prev => [...prev, newMessage]);
        
        // Mark as read if sender is not current user
        if (newMessage.senderId !== user.id) {
          markMessagesAsRead(conversationId, user.id);
        }
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [conversationId, user]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return;
    
    setIsSending(true);
    const messageText = newMessage;
    setNewMessage(''); // Clear input immediately for better UX
    
    const { message, error } = await sendMessage(conversationId, user.id, messageText);
    
    if (error) {
      toast.error(error);
      setNewMessage(messageText); // Restore message on error
    } else if (message) {
      // Message will be added via real-time subscription
      // But we can add it optimistically for instant feedback
      setMessages(prev => [...prev, message]);
    }
    
    setIsSending(false);
  };
  
  if (!user) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading conversation...</p>
      </div>
    );
  }
  
  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Conversation not found</p>
          <Button onClick={() => navigate('/messages')} className="mt-4">
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }
  
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday ' + format(date, 'h:mm a');
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };
  
  // Group messages by sender for better UI
  const groupedMessages = messages.reduce((groups: any[], message, index) => {
    const prevMessage = messages[index - 1];
    const isSameSender = prevMessage && prevMessage.senderId === message.senderId;
    
    if (isSameSender) {
      groups[groups.length - 1].messages.push(message);
    } else {
      groups.push({
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
        messages: [message],
      });
    }
    
    return groups;
  }, []);
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white sticky top-0 z-40 border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/messages')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.otherUser?.avatar} />
              <AvatarFallback>{conversation.otherUser?.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold truncate">{conversation.otherUser?.name}</h2>
              <p className="text-xs text-gray-400">{conversation.otherUser?.city}</p>
            </div>
          </div>
          
          {conversation.eventTitle && (
            <div className="mt-3">
              <Badge variant="outline" className="bg-purple-900/30 border-purple-700 text-purple-300">
                📅 {conversation.eventTitle}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">No messages yet. Say hi! 👋</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedMessages.map((group, groupIndex) => {
              const isCurrentUser = group.senderId === user.id;
              
              return (
                <div
                  key={groupIndex}
                  className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={group.senderAvatar} />
                    <AvatarFallback>{group.senderName[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col gap-1 max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {!isCurrentUser && (
                      <span className="text-xs text-gray-500 px-3">{group.senderName}</span>
                    )}
                    
                    {group.messages.map((message: Message) => (
                      <div key={message.id}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isCurrentUser
                              ? 'bg-black text-white rounded-br-sm'
                              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                        </div>
                        <span className="text-xs text-gray-400 px-3 mt-1 block">
                          {formatMessageDate(message.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Message ${conversation.otherUser?.name}...`}
              className="flex-1"
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="bg-black hover:bg-gray-800"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}