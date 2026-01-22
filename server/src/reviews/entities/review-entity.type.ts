import { ReviewStatus } from '../types/review-status.enum';

export type ReviewEntity = {
  id: string;
  product: {
    id?: string;
    title?: string;
    avgRating?: number;
    reviewCount?: number;
    image?: {
      jpg?: string;
      webp?: string;
      avif?: string;
    };
  };
  user: {
    id?: string;
    name?: string;
    lastName?: string;
    avatar?: {
      jpg?: string;
      webp?: string;
      avif?: string;
    };
  };
  review?: string;
  rating: number;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
};
