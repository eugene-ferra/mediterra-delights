import { Types } from 'mongoose';
import { Review } from '../models/review.schema';
import { ReviewStatus } from './review-status.enum';

type ProductLean = {
  _id: Types.ObjectId;
  title?: string;
  avgRating?: number;
  reviewCount?: number;
  image?: {
    jpg?: string;
    webp?: string;
    avif?: string;
  };
};

type UserLean = {
  _id: Types.ObjectId;
  name?: string;
  lastName?: string;
  avatar?: {
    jpg?: string;
    webp?: string;
    avif?: string;
  };
};

export type ReviewRecordPopulated = Omit<Review, 'productId' | 'userId'> & {
  _id: Types.ObjectId;
  productId: ProductLean;
  userId: UserLean;
};

export type CreateReviewRecord = Omit<
  Review,
  'createdAt' | 'updatedAt' | 'productId' | 'userId'
> & {
  productId: string;
  userId: string;
};

export type UpdateReviewRecord = {
  review?: string;
  rating?: number;
  status?: ReviewStatus;
};
