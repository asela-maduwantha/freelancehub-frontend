export interface Conversation {
  conversationId: string;
  participants: string[];
  createdAt?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
}

export interface CreateConversationDto {
  participant2Id: string;
}

export interface InitializeEncryptionDto {
  conversationId: string;
  publicKey: string;
}

export interface SendMessageDto {
  conversationId: string;
  recipientId: string;
  content: string; // encrypted when sending
}

export interface MessageItem {
  id: string;
  senderId: string;
  recipientId: string;
  content: string; // encrypted content
  status: 'sent' | 'delivered' | 'read';
  createdAt?: string;
}
