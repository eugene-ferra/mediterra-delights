export type ReviewRecord = {
  id: string;
  productId: string;
  userId: string;
  review: string;
  rating: number;
  isModerated: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateReviewRecord = Omit<
  ReviewRecord,
  'id' | 'createdAt' | 'updatedAt' | 'isModerated'
>;

export type UpdateReviewRecord = Partial<CreateReviewRecord> & {
  isModerated?: boolean;
};
