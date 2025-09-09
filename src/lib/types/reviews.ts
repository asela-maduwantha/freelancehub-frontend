export interface CreateReviewDto {
  targetUserId: string;
  rating: number;
  comment?: string;
}

export interface ReviewItem {
  _id: string;
  reviewerId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
