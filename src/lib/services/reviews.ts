import { api } from '../api/api-client';
import type { CreateReviewDto, ReviewItem } from '../types/reviews';

export const ReviewsService = {
  create: (body: CreateReviewDto) => api.post<ReviewItem>('/reviews', body),
  byUser: (userId: string) => api.get<ReviewItem[]>(`/reviews/user/${userId}`),
  statsByUser: (userId: string) => api.get<any>(`/reviews/user/${userId}/stats`),
  getById: (id: string) => api.get<ReviewItem>(`/reviews/${id}`),
  update: (id: string, body: Partial<CreateReviewDto>) => api.put<ReviewItem>(`/reviews/${id}` , body),
  remove: (id: string) => api.delete<string>(`/reviews/${id}`),
  respond: (id: string, body: { response: string }) => api.post<any>(`/reviews/${id}/respond`, body),
  helpful: (id: string) => api.post<any>(`/reviews/${id}/helpful`),
};
