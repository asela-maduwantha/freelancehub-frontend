import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  MessagingState,
  Conversation,
  ChatMessage,
  GetConversationsParams,
  GetMessagesParams,
  SendChatMessageRequest,
  CreateMessageRequest,
} from '../../../types/messages';
import { messagesAPI } from '../../../lib/api/messages';

// Initial state
const initialState: MessagingState = {
  // Connection state
  isConnected: false,
  connectionError: null,

  // Conversations
  conversations: [],
  conversationsLoading: false,
  conversationsError: null,
  conversationsPagination: {
    page: 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  },

  // Current conversation
  currentConversation: null,
  currentConversationId: null,
  messagesLoading: false,
  messagesError: null,

  // Messages
  messages: {},
  messagesPagination: {},

  // Typing indicators
  typingUsers: {},

  // UI state
  sidebarOpen: true,
  messageInputValue: '',
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (params: GetConversationsParams = {}, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.conversations.getConversations(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchConversationDetails = createAsyncThunk(
  'messages/fetchConversationDetails',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.conversations.getConversation(conversationId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch conversation details');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (
    { conversationId, params = {} }: { conversationId: string; params?: GetMessagesParams },
    { rejectWithValue }
  ) => {
    try {
      const response = await messagesAPI.messages.getMessages(conversationId, params);
      return { conversationId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (
    { conversationId, data }: { conversationId: string; data: SendChatMessageRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await messagesAPI.messages.sendMessage(conversationId, data);
      return { conversationId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const createMessage = createAsyncThunk(
  'messages/createMessage',
  async (data: CreateMessageRequest, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.messages.createMessage(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create message');
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'messages/markMessagesAsRead',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await messagesAPI.messages.markAsRead(conversationId);
      return { conversationId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark messages as read');
    }
  }
);

// Slice
const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // Connection state
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      state.connectionError = null;
    },
    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.connectionError = action.payload;
      state.isConnected = false;
    },

    // Current conversation
    setCurrentConversation: (state, action: PayloadAction<string | null>) => {
      state.currentConversationId = action.payload;
      if (action.payload) {
        state.currentConversation = state.conversations.find(c => c.id === action.payload) || null;
      } else {
        state.currentConversation = null;
      }
    },

    // Messages
    addMessage: (state, action: PayloadAction<{ conversationId: string; message: ChatMessage }>) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].unshift(message); // Add to beginning for newest first

      // Update conversation's last message
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.lastMessage = {
          content: message.content,
          sentAt: message.sentAt,
        };
        conversation.unreadCount = message.senderId !== 'currentUserId' ? 0 : conversation.unreadCount; // Reset if sender is current user
      }
    },

    updateMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string; updates: Partial<ChatMessage> }>) => {
      const { conversationId, messageId, updates } = action.payload;
      const messages = state.messages[conversationId];
      if (messages) {
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          messages[messageIndex] = { ...messages[messageIndex], ...updates };
        }
      }
    },

    // Typing indicators
    setTyping: (state, action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      const typingUsers = state.typingUsers[conversationId];
      const userIndex = typingUsers.indexOf(userId);

      if (isTyping && userIndex === -1) {
        typingUsers.push(userId);
      } else if (!isTyping && userIndex !== -1) {
        typingUsers.splice(userIndex, 1);
      }
    },

    clearTyping: (state, action: PayloadAction<string>) => {
      state.typingUsers[action.payload] = [];
    },

    // UI state
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    setMessageInputValue: (state, action: PayloadAction<string>) => {
      state.messageInputValue = action.payload;
    },

    // Utility
    resetMessagesState: () => initialState,

    // Update conversation unread count
    updateUnreadCount: (state, action: PayloadAction<{ conversationId: string; count: number }>) => {
      const { conversationId, count } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.unreadCount = count;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsLoading = true;
        state.conversationsError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload.data.conversations;
        state.conversationsPagination = {
          page: action.payload.data.page,
          totalPages: action.payload.data.totalPages,
          total: action.payload.data.total,
          hasMore: action.payload.data.page < action.payload.data.totalPages,
        };
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.conversationsError = action.payload as string;
      })

      // Fetch conversation details
      .addCase(fetchConversationDetails.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(fetchConversationDetails.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.currentConversation = action.payload.data;
      })
      .addCase(fetchConversationDetails.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload as string;
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, data } = action.payload;
        state.messagesLoading = false;

        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }

        // Prepend older messages for infinite scroll
        state.messages[conversationId] = [...data.messages, ...state.messages[conversationId]];

        state.messagesPagination[conversationId] = {
          page: (state.messagesPagination[conversationId]?.page || 0) + 1,
          hasMore: data.hasMore,
        };
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload as string;
      })

      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, data } = action.payload;
        // Message will be added via WebSocket event, no need to add here
      })

      // Create message
      .addCase(createMessage.fulfilled, (state, action) => {
        // New conversation will be added via WebSocket or refetch
      })

      // Mark as read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        // Update unread count
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.unreadCount = 0;
        }
      });
  },
});

// Actions
export const {
  setConnected,
  setConnectionError,
  setCurrentConversation,
  addMessage,
  updateMessage,
  setTyping,
  clearTyping,
  setSidebarOpen,
  setMessageInputValue,
  resetMessagesState,
  updateUnreadCount,
} = messagesSlice.actions;

// Selectors
export const selectMessagingState = (state: { messages: MessagingState }) => state.messages;
export const selectConversations = (state: { messages: MessagingState }) => state.messages.conversations;
export const selectCurrentConversation = (state: { messages: MessagingState }) => state.messages.currentConversation;
export const selectMessages = (conversationId: string) => (state: { messages: MessagingState }) =>
  state.messages.messages[conversationId] || [];
export const selectTypingUsers = (conversationId: string) => (state: { messages: MessagingState }) =>
  state.messages.typingUsers[conversationId] || [];
export const selectIsConnected = (state: { messages: MessagingState }) => state.messages.isConnected;
export const selectConversationsLoading = (state: { messages: MessagingState }) => state.messages.conversationsLoading;
export const selectConversationsPagination = (state: { messages: MessagingState }) => state.messages.conversationsPagination;
export const selectCurrentConversationId = (state: { messages: MessagingState }) => state.messages.currentConversationId;

export default messagesSlice.reducer;