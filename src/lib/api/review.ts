import { apiClient } from './client';

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  projectId: string;
  rating: number;
  review: string;
  reviewType: 'freelancer' | 'client';
  createdAt: string;
  response?: {
    message: string;
    createdAt: string;
  };
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  project: {
    id: string;
    title: string;
  };
}

export interface CreateReviewData {
  revieweeId: string;
  projectId: string;
  rating: number;
  review: string;
  reviewType: 'freelancer' | 'client';
}

export interface ReviewResponse {
  message: string;
  review: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentReviews: Review[];
}

export const reviewAPI = {
  // Create a new review
  createReview: async (data: CreateReviewData) => {
    return apiClient.post('/reviews', data);
  },

  // Get reviews for a specific user
  getUserReviews: async (userId: string, filters?: {
    reviewType?: 'freelancer' | 'client';
    limit?: number;
    offset?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.reviewType) params.append('reviewType', filters.reviewType);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    return apiClient.get(`/reviews/user/${userId}?${params.toString()}`);
  },

  // Get review statistics for a user
  getUserReviewStats: async (userId: string) => {
    return apiClient.get(`/reviews/user/${userId}/stats`);
  },

  // Respond to a review
  respondToReview: async (reviewId: string, response: string) => {
    return apiClient.post(`/reviews/${reviewId}/respond`, { response });
  },

  // Get all reviews for current user (reviews they've received)
  getMyReviews: async (filters?: {
    status?: 'responded' | 'unresponded';
    limit?: number;
    offset?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    return apiClient.get(`/reviews/my?${params.toString()}`);
  },

  // Update a review (if allowed)
  updateReview: async (reviewId: string, data: Partial<CreateReviewData>) => {
    return apiClient.put(`/reviews/${reviewId}`, data);
  },

  // Delete a review (if allowed)
  deleteReview: async (reviewId: string) => {
    return apiClient.delete(`/reviews/${reviewId}`);
  }
};
