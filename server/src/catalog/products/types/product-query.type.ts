import { ProductsSortKey, SortOrder } from './products-sort.type';

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
};
