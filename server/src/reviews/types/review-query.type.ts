export type ReviewsSortKey =
  | 'createdAt'
  | 'rating'
  | 'isModerated'
  | 'updatedAt';

export type FindManyReviewsQuery = Partial<{
  productId: string;
  userId: string;
  isModerated: boolean;
}>;

export type FindManyReviewsDbQuery = {
  match: Record<string, any>;
  sort: Record<string, 1 | -1>;
  page: number;
  limit: number;
};
