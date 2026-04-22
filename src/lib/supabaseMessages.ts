import { supabase } from './supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// ============================================
// MESSAGE & CONVERSATION MANAGEMENT
// ============================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  eventId?: string;
  eventTitle?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields (not in DB)
  otherUser?: {
    id: string;
    name: string;
    avatar: string;
    city: string;
  };
  unreadCount?: number;
  messages?: Message[];
}

// ============================================
// CONVERSATION FUNCTIONS
// ============================================

export async function getOrCreateConversation(
  user1Id: string,
  user2Id: string,
  eventId?: string
): Promise<{ conversation: Conversation | null; error: string | null }> {
  try {
    // Check if conversation already exists between these two users
    const { data: existingConvs, error: searchError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant1_id.eq.${user1Id},participant2_id.eq.${user2Id}),and(participant1_id.eq.${user2Id},participant2_id.eq.${user1Id})`);
    
    if (searchError) {
      console.error('Search conversations error:', searchError);
      return { conversation: null, error: 'Failed to search conversations' };
    }
    
    // If conversation exists, return it
    if (existingConvs && existingConvs.length > 0) {
      return { conversation: existingConvs[0] as Conversation, error: null };
    }
    
    // Get event info if eventId provided
    let eventTitle: string | undefined;
    if (eventId) {
      const { data: eventData } = await supabase
        .from('events')
        .select('title')
        .eq('id', eventId)
        .single();
      
      eventTitle = eventData?.title;
    }
    
    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        participant1_id: user1Id,
        participant2_id: user2Id,
        event_id: eventId,
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Create conversation error:', createError);
      return { conversation: null, error: 'Failed to create conversation' };
    }
    
    return { conversation: newConv as Conversation, error: null };
  } catch (error) {
    console.error('Unexpected error getting/creating conversation:', error);
    return { conversation: null, error: 'An unexpected error occurred' };
  }
}

export async function getConversations(
  userId: string
): Promise<{ conversations: Conversation[]; error: string | null }> {
  try {
    // Get all conversations where user is a participant
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);
    
    if (convError) {
      console.error('Get conversations error:', convError);
      return { conversations: [], error: 'Failed to load conversations' };
    }
    
    if (!convData || convData.length === 0) {
      return { conversations: [], error: null };
    }
    
    // Get other user IDs
    const otherUserIds = convData.map(conv => 
      conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id
    );
    
    // Get user data for all other participants
    const { data: usersData } = await supabase
      .from('users')
      .select('id, name, avatar_url, city')
      .in('id', otherUserIds);
    
    // Get event data if needed
    const eventIds = convData
      .filter(c => c.event_id)
      .map(c => c.event_id!);
    
    const { data: eventsData } = eventIds.length > 0 
      ? await supabase
          .from('events')
          .select('id, title')
          .in('id', eventIds)
      : { data: [] };
    
    // Get unread counts for each conversation
    const conversationIds = convData.map(c => c.id);
    const { data: messagesData } = await supabase
      .from('messages')
      .select('conversation_id, sender_id, read, content, created_at')
      .in('conversation_id', conversationIds);
    
    // Transform to frontend format
    const conversations: Conversation[] = convData.map(conv => {
      const otherUserId = conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id;
      const otherUser = usersData?.find(u => u.id === otherUserId);
      const event = eventsData?.find(e => e.id === conv.event_id);
      
      // Get messages for this conversation
      const convMessages = messagesData?.filter(m => m.conversation_id === conv.id) || [];
      
      // Count unread messages where sender is the other user
      const unreadCount = convMessages.filter(
        m => m.sender_id === otherUserId && !m.read
      ).length;
      
      // Get last message
      const lastMsg = convMessages.length > 0 
        ? convMessages.reduce((latest, msg) => 
            new Date(msg.created_at) > new Date(latest.created_at) ? msg : latest
          )
        : null;
      
      return {
        id: conv.id,
        participant1Id: conv.participant1_id,
        participant2Id: conv.participant2_id,
        eventId: conv.event_id,
        eventTitle: event?.title,
        lastMessage: lastMsg?.content?.substring(0, 100),
        lastMessageTime: lastMsg?.created_at,
        createdAt: conv.created_at,
        updatedAt: lastMsg?.created_at || conv.created_at, // Use last message time for sorting
        otherUser: otherUser ? {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
          city: otherUser.city,
        } : undefined,
        unreadCount,
      };
    });
    
    // Sort conversations by most recent message
    conversations.sort((a, b) => {
      const timeA = new Date(a.lastMessageTime || a.createdAt).getTime();
      const timeB = new Date(b.lastMessageTime || b.createdAt).getTime();
      return timeB - timeA; // Most recent first
    });
    
    return { conversations, error: null };
  } catch (error) {
    console.error('Unexpected error getting conversations:', error);
    return { conversations: [], error: 'An unexpected error occurred' };
  }
}

export async function getConversationById(
  conversationId: string,
  currentUserId: string
): Promise<{ conversation: Conversation | null; error: string | null }> {
  try {
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (convError) {
      console.error('Get conversation error:', convError);
      return { conversation: null, error: 'Failed to load conversation' };
    }
    
    // Verify user is a participant
    if (convData.participant1_id !== currentUserId && convData.participant2_id !== currentUserId) {
      return { conversation: null, error: 'Access denied' };
    }
    
    // Get other user
    const otherUserId = convData.participant1_id === currentUserId 
      ? convData.participant2_id 
      : convData.participant1_id;
    
    const { data: otherUserData } = await supabase
      .from('users')
      .select('id, name, avatar_url, city')
      .eq('id', otherUserId)
      .single();
    
    // Get event if exists
    let eventTitle: string | undefined;
    if (convData.event_id) {
      const { data: eventData } = await supabase
        .from('events')
        .select('title')
        .eq('id', convData.event_id)
        .single();
      
      eventTitle = eventData?.title;
    }
    
    // Get messages
    const { data: messagesData } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    const messages: Message[] = messagesData?.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      senderName: msg.sender.name,
      senderAvatar: msg.sender.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      text: msg.content,
      createdAt: msg.created_at,
      read: msg.read,
    })) || [];
    
    // Get last message from messages array
    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    
    const conversation: Conversation = {
      id: convData.id,
      participant1Id: convData.participant1_id,
      participant2Id: convData.participant2_id,
      eventId: convData.event_id,
      eventTitle,
      lastMessage: lastMsg?.text?.substring(0, 100),
      lastMessageTime: lastMsg?.createdAt,
      createdAt: convData.created_at,
      updatedAt: lastMsg?.createdAt || convData.created_at, // Use last message time or conversation creation time
      otherUser: otherUserData ? {
        id: otherUserData.id,
        name: otherUserData.name,
        avatar: otherUserData.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        city: otherUserData.city,
      } : undefined,
      messages,
    };
    
    return { conversation, error: null };
  } catch (error) {
    console.error('Unexpected error getting conversation:', error);
    return { conversation: null, error: 'An unexpected error occurred' };
  }
}

// ============================================
// MESSAGE FUNCTIONS
// ============================================

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<{ message: Message | null; error: string | null }> {
  try {
    console.log('📤 [Client->Server] Sending message:', { conversationId, senderId, textLength: text.length });
    
    // Call server-side function with elevated permissions
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-026f502c/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ conversationId, senderId, text }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ [Client] Server error sending message:', result);
      return { message: null, error: result.error || 'Failed to send message' };
    }
    
    console.log('✅ [Client] Message sent via server:', result.message);
    return { message: result.message, error: null };
  } catch (error) {
    console.error('❌ [Client] Unexpected error sending message:', error);
    return { message: null, error: 'An unexpected error occurred' };
  }
}

export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Mark all messages in this conversation as read where sender is NOT the current user
    const { error: updateError } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);
    
    if (updateError) {
      console.error('Mark messages as read error:', updateError);
      return { success: false, error: 'Failed to mark messages as read' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error marking messages as read:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Verify user is the sender
    const { data: messageData, error: fetchError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single();
    
    if (fetchError || messageData.sender_id !== userId) {
      return { success: false, error: 'You can only delete your own messages' };
    }
    
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
    
    if (deleteError) {
      console.error('Delete message error:', deleteError);
      return { success: false, error: 'Failed to delete message' };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting message:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getUnreadMessageCount(
  userId: string
): Promise<{ count: number; error: string | null }> {
  try {
    // Get all conversations for this user
    const { data: convs } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);
    
    if (!convs || convs.length === 0) {
      return { count: 0, error: null };
    }
    
    const conversationIds = convs.map(c => c.id);
    
    // Count unread messages where sender is NOT the current user
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Get unread count error:', error);
      return { count: 0, error: 'Failed to load unread count' };
    }
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Unexpected error getting unread count:', error);
    return { count: 0, error: 'An unexpected error occurred' };
  }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToConversation(
  conversationId: string,
  onNewMessage: (message: Message) => void,
  onMessageUpdated?: (message: Message) => void
) {
  const subscription = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        // Fetch full message with sender data
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users!sender_id(name, avatar_url)
          `)
          .eq('id', payload.new.id)
          .single();
        
        if (data) {
          const message: Message = {
            id: data.id,
            conversationId: data.conversation_id,
            senderId: data.sender_id,
            senderName: data.sender.name,
            senderAvatar: data.sender.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
            text: data.content,
            createdAt: data.created_at,
            read: data.read,
          };
          
          onNewMessage(message);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        if (onMessageUpdated) {
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users!sender_id(name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            const message: Message = {
              id: data.id,
              conversationId: data.conversation_id,
              senderId: data.sender_id,
              senderName: data.sender.name,
              senderAvatar: data.sender.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
              text: data.content,
              createdAt: data.created_at,
              read: data.read,
            };
            
            onMessageUpdated(message);
          }
        }
      }
    )
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}

export function subscribeToConversations(
  userId: string,
  onConversationUpdated: () => void
) {
  const subscription = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant1_id=eq.${userId}`,
      },
      () => {
        onConversationUpdated();
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant2_id=eq.${userId}`,
      },
      () => {
        onConversationUpdated();
      }
    )
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}