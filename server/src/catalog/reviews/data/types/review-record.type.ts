import { ReviewStatus } from '../review.schema';

export type ReviewRecord = {
  id: string;
  productId: string;
  userId: string;
  review?: string;
  rating: number;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateReviewRecord = Omit<
  ReviewRecord,
  'id' | 'createdAt' | 'updatedAt' | 'status'
>;

export type UpdateReviewRecord = Partial<CreateReviewRecord> & {
  status?: ReviewStatus;
};
