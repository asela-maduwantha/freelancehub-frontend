import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import {
  setConnected,
  setConnectionError,
  setCurrentConversation,
  addMessage,
  setTyping,
  clearTyping,
  updateUnreadCount,
  selectIsConnected,
  selectCurrentConversationId,
} from '../../store/slices/messages';
import {
  WebSocketAuth,
  JoinConversationEvent,
  LeaveConversationEvent,
  SendMessageEvent,
  CreateMessageEvent,
  TypingEvent,
  MarkAsReadEvent,
  ConnectedEvent,
  NewMessageEvent,
  MessageNotificationEvent,
  UserTypingEvent,
  MessagesReadEvent,
  ChatMessage,
} from '../../types/messages';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000/messages';

/**
 * Custom hook for Socket.IO messaging integration
 */
export const useMessagingSocket = (token: string | null) => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const isConnected = useSelector(selectIsConnected);
  const currentConversationId = useSelector(selectCurrentConversationId);

  // Initialize socket connection
  const connect = useCallback(() => {
    if (!token || socketRef.current?.connected) return;

    try {
      socketRef.current = io(WS_URL, {
        auth: { token } as WebSocketAuth,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        console.log('WebSocket connected:', socket.id);
        dispatch(setConnected(true));
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        dispatch(setConnected(false));
        if (reason === 'io server disconnect') {
          // Server disconnected, manual reconnection needed
          socket.connect();
        }
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        dispatch(setConnectionError(error.message));
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('WebSocket reconnected after', attemptNumber, 'attempts');
        dispatch(setConnected(true));
        dispatch(setConnectionError(null));
      });

      socket.on('reconnect_error', (error) => {
        console.error('WebSocket reconnection failed:', error);
        dispatch(setConnectionError(`Reconnection failed: ${error.message}`));
      });

      // Message events
      socket.on('connected', (data: ConnectedEvent) => {
        console.log('Authenticated connection:', data);
      });

      socket.on('new_message', (message: NewMessageEvent) => {
        console.log('New message received:', message);
        dispatch(addMessage({
          conversationId: message.conversationId,
          message,
        }));
      });

      socket.on('message_notification', (data: MessageNotificationEvent) => {
        console.log('Message notification:', data);
        // Update unread count for the conversation
        dispatch(updateUnreadCount({
          conversationId: data.conversationId,
          count: 1, // Increment unread count
        }));
      });

      socket.on('user_typing', (data: UserTypingEvent) => {
        console.log('User typing:', data);
        dispatch(setTyping({
          conversationId: data.conversationId,
          userId: data.userId,
          isTyping: data.isTyping,
        }));
      });

      socket.on('messages_read', (data: MessagesReadEvent) => {
        console.log('Messages read:', data);
        // Update read status in messages
        // This would typically update the UI to show messages as read
      });

    } catch (error) {
      console.error('Failed to initialize socket:', error);
      dispatch(setConnectionError('Failed to initialize connection'));
    }
  }, [token, dispatch]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting WebSocket');
      socketRef.current.disconnect();
      socketRef.current = null;
      dispatch(setConnected(false));
    }
  }, [dispatch]);

  // Join conversation room
  const joinConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('Socket not connected, cannot join conversation');
      return;
    }

    console.log('Joining conversation:', conversationId);
    socketRef.current.emit('join_conversation', {
      conversationId,
    } as JoinConversationEvent, (response: { success: boolean; error?: string }) => {
      if (response.success) {
        console.log('Successfully joined conversation:', conversationId);
        dispatch(setCurrentConversation(conversationId));
      } else {
        console.error('Failed to join conversation:', response.error);
      }
    });
  }, [dispatch]);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('Socket not connected, cannot leave conversation');
      return;
    }

    console.log('Leaving conversation:', conversationId);
    socketRef.current.emit('leave_conversation', {
      conversationId,
    } as LeaveConversationEvent, (response: { success: boolean; error?: string }) => {
      if (response.success) {
        console.log('Successfully left conversation:', conversationId);
        if (currentConversationId === conversationId) {
          dispatch(setCurrentConversation(null));
        }
      } else {
        console.error('Failed to leave conversation:', response.error);
      }
    });
  }, [currentConversationId, dispatch]);

  // Send message
  const sendMessage = useCallback((
    conversationId: string,
    content: string,
    attachments?: any[]
  ) => {
    if (!socketRef.current?.connected) {
      console.warn('Socket not connected, cannot send message');
      return Promise.reject(new Error('Not connected'));
    }

    return new Promise<{ success: boolean; data?: ChatMessage; error?: string }>((resolve) => {
      console.log('Sending message to conversation:', conversationId);
      socketRef.current!.emit('send_message', {
        conversationId,
        content,
        attachments,
      } as SendMessageEvent, (response: { success: boolean; data?: ChatMessage; error?: string }) => {
        if (response.success) {
          console.log('Message sent successfully');
          resolve(response);
        } else {
          console.error('Failed to send message:', response.error);
          resolve(response);
        }
      });
    });
  }, []);

  // Create message (start new conversation)
  const createMessage = useCallback((
    contractId: string,
    content: string,
    milestoneId?: string,
    attachments?: any[]
  ) => {
    if (!socketRef.current?.connected) {
      console.warn('Socket not connected, cannot create message');
      return Promise.reject(new Error('Not connected'));
    }

    return new Promise<{ success: boolean; data?: any; error?: string }>((resolve) => {
      console.log('Creating message for contract:', contractId);
      socketRef.current!.emit('create_message', {
        contractId,
        content,
        milestoneId,
        attachments,
      } as CreateMessageEvent, (response: { success: boolean; data?: any; error?: string }) => {
        if (response.success) {
          console.log('Message created successfully');
          resolve(response);
        } else {
          console.error('Failed to create message:', response.error);
          resolve(response);
        }
      });
    });
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((
    conversationId: string,
    isTyping: boolean
  ) => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit('typing', {
      conversationId,
      isTyping,
    } as TypingEvent);
  }, []);

  // Mark messages as read
  const markAsRead = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('Socket not connected, cannot mark as read');
      return;
    }

    console.log('Marking messages as read for conversation:', conversationId);
    socketRef.current.emit('mark_as_read', {
      conversationId,
    } as MarkAsReadEvent, (response: { success: boolean; error?: string }) => {
      if (response.success) {
        console.log('Messages marked as read');
        dispatch(updateUnreadCount({
          conversationId,
          count: 0,
        }));
      } else {
        console.error('Failed to mark messages as read:', response.error);
      }
    });
  }, [dispatch]);

  // Auto-connect when token is available
  useEffect(() => {
    if (token && !socketRef.current) {
      connect();
    }

    return () => {
      // Cleanup on unmount or token change
      if (socketRef.current && !token) {
        disconnect();
      }
    };
  }, [token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    // State
    isConnected,

    // Actions
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendMessage,
    createMessage,
    sendTyping,
    markAsRead,

    // Socket instance (for advanced usage)
    socket: socketRef.current,
  };
};

/**
 * Hook for managing conversation-specific socket operations
 */
export const useConversationSocket = (conversationId: string | null) => {
  const {
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    markAsRead,
    isConnected,
  } = useMessagingSocket(null); // Token will be handled by parent hook

  // Join conversation when conversationId changes
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);
    }

    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, isConnected, joinConversation, leaveConversation]);

  return {
    sendMessage: (content: string, attachments?: any[]) =>
      conversationId ? sendMessage(conversationId, content, attachments) : Promise.reject(new Error('No conversation selected')),

    sendTyping: (isTyping: boolean) =>
      conversationId ? sendTyping(conversationId, isTyping) : undefined,

    markAsRead: () =>
      conversationId ? markAsRead(conversationId) : undefined,
  };
};