// Platform API services (messaging, payments, notifications, reviews, files)
import apiClient from '../axios-instance';
import { 
  ApiResponse, 
  PaginatedResponse,
  Message,
  Conversation,
  SendMessageData,
  MessageFilters,
  Payment,
  PaymentIntent,
  CreatePaymentIntentData,
  ProcessPaymentData,
  Payout,
  CreatePayoutRequest,
  PaymentMethod,
  Notification,
  NotificationFilters,
  NotificationStats,
  Review,
  CreateReviewData,
  ReviewStats,
  ReviewFilters,
  FileMetadata,
  FileUploadResponse,
  FileFilters,
  EarningsStats,
  ActivityItem
} from '../../types';

// Messaging APIs
export const messagingApi = {
  // Send message
  sendMessage: async (messageData: SendMessageData): Promise<ApiResponse<{ message: Message }>> => {
    const response = await apiClient.post('/api/v1/messaging/messages', messageData);
    return response.data as ApiResponse<{ message: Message }>;
  },

  // Get conversations
  getConversations: async (page?: number, limit?: number): Promise<PaginatedResponse<{ conversations: Conversation[] }>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const response = await apiClient.get(`/api/v1/messaging/conversations?${params.toString()}`);
    return response.data as PaginatedResponse<{ conversations: Conversation[] }>;
  },

  // Get conversation messages
  getMessages: async (conversationId: string, filters?: MessageFilters): Promise<PaginatedResponse<{ messages: Message[] }>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`/api/v1/messaging/conversations/${conversationId}/messages?${params.toString()}`);
    return response.data as PaginatedResponse<{ messages: Message[] }>;
  },

  // Mark messages as read
  markAsRead: async (messageIds: string[]): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/messaging/messages/mark-read', { messageIds });
    return response.data as ApiResponse<any>;
  },

  // Mark conversation as read
  markConversationAsRead: async (conversationId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/messaging/conversations/${conversationId}/mark-read`);
    return response.data as ApiResponse<any>;
  },

  // Delete message
  deleteMessage: async (messageId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/messaging/messages/${messageId}`);
    return response.data as ApiResponse<any>;
  },

  // Edit message
  editMessage: async (messageId: string, content: string): Promise<ApiResponse<{ message: Message }>> => {
    const response = await apiClient.put(`/api/v1/messaging/messages/${messageId}`, { content });
    return response.data as ApiResponse<{ message: Message }>;
  },

  // Archive conversation
  archiveConversation: async (conversationId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/messaging/conversations/${conversationId}/archive`);
    return response.data as ApiResponse<any>;
  },

  // Mute conversation
  muteConversation: async (conversationId: string, duration?: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/messaging/conversations/${conversationId}/mute`, { duration });
    return response.data as ApiResponse<any>;
  },

  // Get unread count
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.get('/api/v1/messaging/unread-count');
    return response.data as ApiResponse<{ count: number }>;
  }
};

// Payment APIs
export const paymentApi = {
  // Create payment intent
  createPaymentIntent: async (intentData: CreatePaymentIntentData): Promise<ApiResponse<{ paymentIntent: PaymentIntent }>> => {
    const response = await apiClient.post('/api/v1/payments/intent', intentData);
    return response.data as ApiResponse<{ paymentIntent: PaymentIntent }>;
  },

  // Process payment
  processPayment: async (paymentData: ProcessPaymentData): Promise<ApiResponse<{ payment: Payment }>> => {
    const response = await apiClient.post('/api/v1/payments/process', paymentData);
    return response.data as ApiResponse<{ payment: Payment }>;
  },

  // Process milestone payment
  processMilestonePayment: async (milestoneId: string, amount: number): Promise<ApiResponse<{ payment: Payment }>> => {
    const response = await apiClient.post('/api/v1/payments/milestone', { milestoneId, amount });
    return response.data as ApiResponse<{ payment: Payment }>;
  },

  // Get payment history
  getPaymentHistory: async (page?: number, limit?: number): Promise<PaginatedResponse<{ payments: Payment[] }>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const response = await apiClient.get(`/api/v1/payments/history?${params.toString()}`);
    return response.data as PaginatedResponse<{ payments: Payment[] }>;
  },

  // Get payment methods
  getPaymentMethods: async (): Promise<ApiResponse<PaymentMethod[]>> => {
    const response = await apiClient.get('/api/v1/payments/methods');
    return response.data as ApiResponse<PaymentMethod[]>;
  },

  // Add payment method
  addPaymentMethod: async (methodData: {
    type: string;
    token: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<PaymentMethod>> => {
    const response = await apiClient.post('/api/v1/payments/methods', methodData);
    return response.data as ApiResponse<PaymentMethod>;
  },

  // Update payment method
  updatePaymentMethod: async (methodId: string, updateData: {
    isDefault?: boolean;
  }): Promise<ApiResponse<PaymentMethod>> => {
    const response = await apiClient.put(`/api/v1/payments/methods/${methodId}`, updateData);
    return response.data as ApiResponse<PaymentMethod>;
  },

  // Delete payment method
  deletePaymentMethod: async (methodId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/payments/methods/${methodId}`);
    return response.data as ApiResponse<any>;
  },

  // Request payout
  requestPayout: async (payoutData: CreatePayoutRequest): Promise<ApiResponse<{ payout: Payout }>> => {
    const response = await apiClient.post('/api/v1/freelancer/payout', payoutData);
    return response.data as ApiResponse<{ payout: Payout }>;
  },

  // Get payout history
  getPayoutHistory: async (): Promise<ApiResponse<Payout[]>> => {
    const response = await apiClient.get('/api/v1/freelancer/payouts');
    return response.data as ApiResponse<Payout[]>;
  },

  // Get earnings overview
  getEarningsOverview: async (period?: string, year?: number): Promise<ApiResponse<EarningsStats>> => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (year) params.append('year', year.toString());

    const response = await apiClient.get(`/api/v1/freelancer/earnings?${params.toString()}`);
    return response.data as ApiResponse<EarningsStats>;
  }
};

// Notification APIs
export const notificationApi = {
  // Get notifications
  getNotifications: async (filters?: NotificationFilters): Promise<PaginatedResponse<{ notifications: Notification[] }>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`/api/v1/notifications?${params.toString()}`);
    return response.data as PaginatedResponse<{ notifications: Notification[] }>;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/api/v1/notifications/${notificationId}/read`);
    return response.data as ApiResponse<any>;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/api/v1/notifications/read-all');
    return response.data as ApiResponse<any>;
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/notifications/${notificationId}`);
    return response.data as ApiResponse<any>;
  },

  // Get notification statistics
  getNotificationStats: async (): Promise<ApiResponse<NotificationStats>> => {
    const response = await apiClient.get('/api/v1/notifications/stats');
    return response.data as ApiResponse<NotificationStats>;
  },

  // Update notification preferences
  updatePreferences: async (preferences: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/api/v1/notifications/preferences', preferences);
    return response.data as ApiResponse<any>;
  },

  // Get notification preferences
  getPreferences: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/api/v1/notifications/preferences');
    return response.data as ApiResponse<any>;
  }
};

// Review APIs
export const reviewApi = {
  // Create review
  createReview: async (reviewData: CreateReviewData): Promise<ApiResponse<{ review: Review }>> => {
    const response = await apiClient.post('/api/v1/reviews', reviewData);
    return response.data as ApiResponse<{ review: Review }>;
  },

  // Get reviews
  getReviews: async (filters?: ReviewFilters): Promise<PaginatedResponse<{ reviews: Review[] }>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`/api/v1/reviews?${params.toString()}`);
    return response.data as PaginatedResponse<{ reviews: Review[] }>;
  },

  // Respond to review
  respondToReview: async (reviewId: string, response: string): Promise<ApiResponse<any>> => {
    const responseData = await apiClient.post(`/api/v1/reviews/${reviewId}/response`, { response });
    return responseData.data as ApiResponse<any>;
  },

  // Mark review as helpful
  markAsHelpful: async (reviewId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/reviews/${reviewId}/helpful`);
    return response.data as ApiResponse<any>;
  },

  // Get review statistics
  getReviewStats: async (userId?: string): Promise<ApiResponse<ReviewStats>> => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await apiClient.get(`/api/v1/reviews/stats${params}`);
    return response.data as ApiResponse<ReviewStats>;
  },

  // Flag review
  flagReview: async (reviewId: string, reason: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/v1/reviews/${reviewId}/flag`, { reason });
    return response.data as ApiResponse<any>;
  }
};

// File Upload APIs
export const fileApi = {
  // Upload single file
  uploadSingle: async (file: File, category?: string): Promise<ApiResponse<FileMetadata>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);

    const response = await apiClient.post('/api/v1/uploads/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as ApiResponse<FileMetadata>;
  },

  // Upload multiple files
  uploadMultiple: async (files: File[], category?: string): Promise<ApiResponse<FileUploadResponse>> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (category) formData.append('category', category);

    const response = await apiClient.post('/api/v1/uploads/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as ApiResponse<FileUploadResponse>;
  },

  // Get user files
  getUserFiles: async (filters?: FileFilters): Promise<PaginatedResponse<{ files: FileMetadata[] }>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get(`/api/v1/uploads/user-files?${params.toString()}`);
    return response.data as PaginatedResponse<{ files: FileMetadata[] }>;
  },

  // Delete file
  deleteFile: async (fileId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/api/v1/uploads/${fileId}`);
    return response.data as ApiResponse<any>;
  },

  // Get file details
  getFileDetails: async (fileId: string): Promise<ApiResponse<FileMetadata>> => {
    const response = await apiClient.get(`/api/v1/uploads/${fileId}`);
    return response.data as ApiResponse<FileMetadata>;
  },

  // Update file metadata
  updateFileMetadata: async (fileId: string, metadata: {
    category?: string;
    tags?: string[];
    public?: boolean;
  }): Promise<ApiResponse<FileMetadata>> => {
    const response = await apiClient.put(`/api/v1/uploads/${fileId}`, metadata);
    return response.data as ApiResponse<FileMetadata>;
  }
};

// Activity APIs
export const activityApi = {
  // Get user activity
  getUserActivity: async (limit?: number): Promise<ApiResponse<ActivityItem[]>> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get(`/api/v1/user/activity${params}`);
    return response.data as ApiResponse<ActivityItem[]>;
  },

  // Get platform activity (public)
  getPlatformActivity: async (): Promise<ApiResponse<ActivityItem[]>> => {
    const response = await apiClient.get('/api/v1/public/activity');
    return response.data as ApiResponse<ActivityItem[]>;
  }
};

// Stats APIs
export const getClientStats = async () => {
  try {
    const response = await apiClient.get('/api/v1/client/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFreelancerStats = async () => {
  try {
    const response = await apiClient.get('/api/v1/freelancer/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { messagingApi as default };
