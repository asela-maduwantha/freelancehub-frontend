import { apiClient } from '../client';
import {
  CreateMessageRequest,
  CreateMessageResponse,
  GetConversationsResponse,
  GetMessagesResponse,
  SendChatMessageRequest,
  SendMessageResponse,
  MarkAsReadResponse,
  GetConversationsParams,
  GetMessagesParams,
  Conversation,
  ChatMessage,
} from '../../../types/messages';

/**
 * Messages API service
 * Handles all REST API calls for messaging functionality
 */

const MESSAGES_BASE_URL = '/messages';

// Conversations API
export const conversationsApi = {
  /**
   * Get all conversations for the authenticated user
   */
  getConversations: async (params: GetConversationsParams = {}): Promise<GetConversationsResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.contractId) queryParams.append('contractId', params.contractId);
    if (params.includeArchived !== undefined) queryParams.append('includeArchived', params.includeArchived.toString());

    const url = `${MESSAGES_BASE_URL}/conversations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return await apiClient.getFullResponse(url);
  },

  /**
   * Get details of a specific conversation
   */
  getConversation: async (conversationId: string): Promise<{ success: boolean; data: Conversation }> => {
    return await apiClient.getFullResponse(`${MESSAGES_BASE_URL}/conversations/${conversationId}`);
  },
};

// Messages API
export const messagesApi = {
  /**
   * Create a new message (starts conversation if needed)
   */
  createMessage: async (data: CreateMessageRequest): Promise<CreateMessageResponse> => {
    return await apiClient.postFullResponse(MESSAGES_BASE_URL, data);
  },

  /**
   * Get messages for a conversation
   */
  getMessages: async (
    conversationId: string,
    params: GetMessagesParams = {}
  ): Promise<GetMessagesResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.before) queryParams.append('before', params.before);

    const url = `${MESSAGES_BASE_URL}/conversations/${conversationId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return await apiClient.getFullResponse(url);
  },

  /**
   * Send a message in an existing conversation
   */
  sendMessage: async (
    conversationId: string,
    data: SendChatMessageRequest
  ): Promise<SendMessageResponse> => {
    return await apiClient.postFullResponse(`${MESSAGES_BASE_URL}/conversations/${conversationId}/messages`, data);
  },

  /**
   * Mark all messages in a conversation as read
   */
  markAsRead: async (conversationId: string): Promise<MarkAsReadResponse> => {
    return await apiClient.patchFullResponse(`${MESSAGES_BASE_URL}/conversations/${conversationId}/read`);
  },
};

// Combined API object for easy importing
export const messagesAPI = {
  conversations: conversationsApi,
  messages: messagesApi,
};

// Default export
export default messagesAPI;