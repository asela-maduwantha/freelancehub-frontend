import { api } from '../api/api-client';
import type { Conversation, CreateConversationDto, InitializeEncryptionDto, SendMessageDto, MessageItem } from '../types/messaging';

export const MessagingService = {
  createConversation: (body: CreateConversationDto) => api.post<Conversation>('/messaging/conversations', body),
  initializeEncryption: (body: InitializeEncryptionDto) => api.post<{ conversationKey: any; encryptedKeyShare: string }>(
    '/messaging/encryption/initialize',
    body
  ),
  sendMessage: (body: SendMessageDto, conversationKey: string) =>
    api.post<{ messageId: string; status: string; createdAt: string }>(`/messaging/messages`, body, {
      headers: { 'x-conversation-key': conversationKey },
    }),
  conversations: () => api.get<Conversation[]>(`/messaging/conversations`),
  messages: (conversationId: string, conversationKey: string, page?: number, limit?: number) =>
    api.get<MessageItem[]>(`/messaging/conversations/${conversationId}/messages`, {
      headers: { 'x-conversation-key': conversationKey },
      params: { page, limit },
    }),
  markRead: (conversationId: string) => api.put<string>(`/messaging/conversations/${conversationId}/read`),
  getEncryptionKey: (conversationId: string, privateKeyPem: string) =>
    api.get<{ key: string }>(`/messaging/encryption/key/${conversationId}`, {
      headers: { 'x-private-key': privateKeyPem },
    }),
  deleteMessage: (messageId: string) => api.delete<string>(`/messaging/messages/${messageId}`),
};
