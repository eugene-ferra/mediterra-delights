export type CategoryRecord = {
  id: string;
  title: string;
  slug: string;
  isActive: boolean;
};

export type CreateCategoryRecord = Omit<CategoryRecord, 'id'>;

export type UpdateCategoryRecord = Partial<CategoryRecord>;
