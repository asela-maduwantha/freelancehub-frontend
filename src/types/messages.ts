// Message-related TypeScript types and interfaces

export interface UserParticipant {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email?: string;
}

export interface MessageAttachment {
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: UserParticipant;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'file' | 'system';
  attachments: MessageAttachment[];
  isRead: boolean;
  isEdited: boolean;
  sentAt: string;
  readAt?: string;
  editedAt?: string;
}

export interface Conversation {
  id: string;
  contractId: string;
  milestoneId?: string;
  client: UserParticipant;
  freelancer: UserParticipant;
  lastMessage?: {
    content: string;
    sentAt: string;
  };
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithDetails extends Conversation {
  messages?: ChatMessage[];
  hasMore?: boolean;
}

// API Request/Response types
export interface CreateMessageRequest {
  contractId: string;
  milestoneId?: string;
  content: string;
  attachments?: MessageAttachment[];
}

export interface CreateMessageResponse {
  success: boolean;
  data: {
    id: string;
    conversationId: string;
    content: string;
    senderId: string;
    sentAt: string;
  };
}

export interface GetConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface GetMessagesResponse {
  success: boolean;
  data: {
    messages: ChatMessage[];
    hasMore: boolean;
  };
}

export interface SendChatMessageRequest {
  content: string;
  attachments?: MessageAttachment[];
}

export interface SendMessageResponse {
  success: boolean;
  data: ChatMessage;
}

export interface MarkAsReadResponse {
  success: boolean;
  data: {
    conversationId: string;
    markedCount: number;
  };
}

// WebSocket event types
export interface WebSocketAuth {
  token: string;
}

export interface ConnectedEvent {
  userId: string;
  socketId: string;
}

export interface JoinConversationEvent {
  conversationId: string;
}

export interface LeaveConversationEvent {
  conversationId: string;
}

export interface SendMessageEvent {
  conversationId: string;
  content: string;
  attachments?: MessageAttachment[];
}

export interface CreateMessageEvent {
  contractId: string;
  milestoneId?: string;
  content: string;
  attachments?: MessageAttachment[];
}

export interface TypingEvent {
  conversationId: string;
  isTyping: boolean;
}

export interface MarkAsReadEvent {
  conversationId: string;
}

export interface NewMessageEvent extends ChatMessage {}

export interface MessageNotificationEvent {
  conversationId: string;
  message: ChatMessage;
}

export interface UserTypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessagesReadEvent {
  conversationId: string;
  userId: string;
}

// Redux state types
export interface MessagingState {
  // Connection state
  isConnected: boolean;
  connectionError: string | null;

  // Conversations
  conversations: Conversation[];
  conversationsLoading: boolean;
  conversationsError: string | null;
  conversationsPagination: {
    page: number;
    totalPages: number;
    total: number;
    hasMore: boolean;
  };

  // Current conversation
  currentConversation: ConversationWithDetails | null;
  currentConversationId: string | null;
  messagesLoading: boolean;
  messagesError: string | null;

  // Messages
  messages: { [conversationId: string]: ChatMessage[] };
  messagesPagination: { [conversationId: string]: {
    page: number;
    hasMore: boolean;
  }};

  // Typing indicators
  typingUsers: { [conversationId: string]: string[] };

  // UI state
  sidebarOpen: boolean;
  messageInputValue: string;
}

// API query parameters
export interface GetConversationsParams {
  page?: number;
  limit?: number;
  contractId?: string;
  includeArchived?: boolean;
}

export interface GetMessagesParams {
  page?: number;
  limit?: number;
  before?: string;
}

// Utility types
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatMessageWithStatus extends ChatMessage {
  status: MessageStatus;
  localId?: string; // For optimistic updates
}

export interface ConversationFilters {
  contractId?: string;
  hasUnread?: boolean;
  archived?: boolean;
}