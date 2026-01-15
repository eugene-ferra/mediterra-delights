export type ReviewsSortKey =
  | 'createdAt'
  | 'rating'
  | 'isModerated'
  | 'updatedAt';

export type SortOrder = 'asc' | 'desc';

export type FindManyReviewsQuery = Partial<{
  productId: string;
  userId: string;
  isModerated: boolean;
  rating: number;
  ratingGte: number;
  ratingLte: number;
}>;
