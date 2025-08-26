import apiClient from "../../api/axios-instance";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
  }>;
}

export interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  }>;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
  projectId?: string;
  projectTitle?: string;
}

export const messageApi = {
  // Get all conversations for the current user
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await apiClient.get('/messages/conversations');
      return response.data as Conversation[];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  // Get messages for a specific conversation
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<{
    messages: Message[];
    hasMore: boolean;
  }> {
    try {
      const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`, {
        params: { page, limit }
      });
      return response.data as { messages: Message[]; hasMore: boolean };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { messages: [], hasMore: false };
    }
  },

  // Send a new message
  async sendMessage(conversationId: string, content: string, attachments?: File[]): Promise<Message> {
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      if (attachments && attachments.length > 0) {
        attachments.forEach((file, index) => {
          formData.append(`attachments`, file);
        });
      }

      const response = await apiClient.post(`/messages/conversations/${conversationId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as Message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Create a new conversation
  async createConversation(participantId: string, projectId?: string): Promise<Conversation> {
    try {
      const response = await apiClient.post('/messages/conversations', {
        participantId,
        projectId
      });
      return response.data as Conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Mark messages as read
  async markAsRead(conversationId: string): Promise<void> {
    try {
      await apiClient.patch(`/messages/conversations/${conversationId}/read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  // Search messages
  async searchMessages(query: string): Promise<{
    conversations: Conversation[];
    messages: Message[];
  }> {
    try {
      const response = await apiClient.get('/messages/search', {
        params: { q: query }
      });
      return response.data as { conversations: Conversation[]; messages: Message[] };
    } catch (error) {
      console.error('Error searching messages:', error);
      return { conversations: [], messages: [] };
    }
  },

  // Delete a conversation
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await apiClient.delete(`/messages/conversations/${conversationId}`);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  // Archive a conversation
  async archiveConversation(conversationId: string): Promise<void> {
    try {
      await apiClient.patch(`/messages/conversations/${conversationId}/archive`);
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  }
};
