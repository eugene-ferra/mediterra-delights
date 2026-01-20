export type ProductsVisibility = {
  includeInactiveProducts: boolean;
  includeInactiveCategories: boolean;
};

export type ProductsSortKey =
  | 'createdAt'
  | 'price'
  | 'avgRating'
  | 'reviewCount'
  | 'title';

export type SortOrder = 'asc' | 'desc';

export type FindManyProductsQuery = {
  // pagination
  page?: number; // default 1
  limit?: number; // default 20, max 100

  // sorting
  sortBy?: ProductsSortKey; // default 'createdAt'
  sortOrder?: SortOrder; // default 'desc'

  // filters
  categoryId?: string;
  isVegan?: boolean;
  isNewProduct?: boolean;

  minPrice?: number;
  maxPrice?: number;

  minRating?: number;

  // search
  q?: string; // title/description/fullText

  includeInactive?: boolean;
};

export type FindManyProductsDbQuery = {
  match: Record<string, any>;
  sort: Record<string, 1 | -1 | { $meta: 'textScore' }>;
  page: number;
  limit: number;
  withTextScore: boolean;
  visibility: ProductsVisibility;
};
