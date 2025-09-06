export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  encryptionKey?: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'client' | 'freelancer';
  isOnline: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
  attachments?: Attachment[];
  reactions?: MessageReaction[];
  replyTo?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'proposal' | 'payment' | 'milestone' | 'review' | 'system';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  messages: NotificationChannelSettings;
  proposals: NotificationChannelSettings;
  payments: NotificationChannelSettings;
  milestones: NotificationChannelSettings;
  reviews: NotificationChannelSettings;
  system: NotificationChannelSettings;
  doNotDisturb: {
    enabled: boolean;
    startTime?: string;
    endTime?: string;
  };
  soundEnabled: boolean;
}

export interface NotificationChannelSettings {
  push: boolean;
  email: boolean;
  inApp: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface WebSocketMessage {
  type: 'new_message' | 'message_sent' | 'user_online' | 'user_offline' | 'typing' | 'notification';
  data: any;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}
