export interface IReview {
  _id: string;
  contractId: string;
  reviewerId: string;
  revieweeId: string;
  type: 'client-to-freelancer' | 'freelancer-to-client';
  ratings: {
    overall: number;
    communication: number;
    quality: number;
    timeliness: number;
  };
  comment: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  projectId: string;
  rating: number;
  review: string;
  reviewType: string;
  createdAt: string;
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