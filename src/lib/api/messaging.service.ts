import { apiClient } from '../api';
import {
  Conversation,
  Message,
  Notification,
  NotificationSettings,
  WebSocketMessage
} from '../types';

export class MessagingService {
  // Conversations
  static async getConversations(): Promise<Conversation[]> {
    return apiClient.get<Conversation[]>('/messaging/conversations');
  }

  static async getConversation(conversationId: string): Promise<Conversation> {
    return apiClient.get<Conversation>(`/messaging/conversations/${conversationId}`);
  }

  static async createConversation(participantIds: string[], projectId?: string): Promise<Conversation> {
    return apiClient.post<Conversation>('/messaging/conversations', {
      participantIds,
      projectId
    });
  }

  // Messages
  static async getMessages(conversationId: string, page = 1, limit = 50): Promise<Message[]> {
    return apiClient.get<Message[]>(`/messaging/conversations/${conversationId}/messages`, {
      page,
      limit
    });
  }

  static async sendMessage(conversationId: string, content: string, type: 'text' | 'file' = 'text'): Promise<Message> {
    return apiClient.post<Message>('/messaging/messages', {
      conversationId,
      content,
      type
    });
  }

  static async markMessageAsRead(messageId: string): Promise<void> {
    return apiClient.put(`/messaging/messages/${messageId}/read`);
  }

  // Encryption
  static async initializeEncryption(conversationId: string): Promise<{ encryptionKey: string }> {
    return apiClient.post<{ encryptionKey: string }>(`/messaging/encryption/initialize`, {
      conversationId
    });
  }

  static async getEncryptionKey(conversationId: string): Promise<{ encryptionKey: string }> {
    return apiClient.get<{ encryptionKey: string }>(`/messaging/encryption/key/${conversationId}`);
  }

  // Notifications
  static async getNotifications(page = 1, limit = 20): Promise<Notification[]> {
    return apiClient.get<Notification[]>('/notifications', {
      page,
      limit
    });
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    return apiClient.put(`/notifications/${notificationId}/read`);
  }

  static async markAllNotificationsAsRead(): Promise<void> {
    return apiClient.put('/notifications/read-all');
  }

  static async getNotificationSettings(): Promise<NotificationSettings> {
    return apiClient.get<NotificationSettings>('/notifications/settings');
  }

  static async updateNotificationSettings(settings: NotificationSettings): Promise<void> {
    return apiClient.put('/notifications/settings', settings);
  }

  static async updateFCMToken(token: string): Promise<void> {
    return apiClient.put('/notifications/fcm-token', { token });
  }

  // Search
  static async searchUsers(query: string): Promise<any[]> {
    return apiClient.get<any[]>('/users/search', {
      q: query
    });
  }
}

export const messagingService = new MessagingService();
