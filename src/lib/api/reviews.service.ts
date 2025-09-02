import { apiClient } from './client';
import { CreateReviewRequest, IReview, IApiResponse } from '../types';

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
  recentReviews: IReview[];
}

export class ReviewsService {
  /**
   * Create a new review
   */
  async createReview(data: CreateReviewRequest): Promise<IReview> {
    return apiClient.post('/reviews', data);
  }

  /**
   * Get reviews for a user
   */
  async getUserReviews(
    userId: string, 
    params?: { limit?: number; offset?: number; rating?: number; reviewType?: string }
  ): Promise<IReview[]> {
    return apiClient.get(`/reviews/user/${userId}`, params);
  }

  /**
   * Get review statistics for a user
   */
  async getUserReviewStats(userId: string): Promise<ReviewStats> {
    return apiClient.get(`/reviews/user/${userId}/stats`);
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string): Promise<IReview> {
    return apiClient.get(`/reviews/${id}`);
  }

  /**
   * Update review
   */
  async updateReview(id: string, data: { rating?: number; comment?: string }): Promise<IApiResponse> {
    return apiClient.put(`/reviews/${id}`, data);
  }

  /**
   * Delete review
   */
  async deleteReview(id: string): Promise<IApiResponse> {
    return apiClient.delete(`/reviews/${id}`);
  }

  /**
   * Respond to review
   */
  async respondToReview(id: string, response: string): Promise<IApiResponse> {
    return apiClient.post(`/reviews/${id}/respond`, { response });
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(id: string): Promise<IApiResponse> {
    return apiClient.post(`/reviews/${id}/helpful`);
  }
}

export const reviewsService = new ReviewsService();