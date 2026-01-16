import { ReviewStatus } from '../data/review.schema';

export type ReviewEntity = {
  id: string;
  productId: string;
  userId: string;
  review?: string;
  rating: number;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
};
