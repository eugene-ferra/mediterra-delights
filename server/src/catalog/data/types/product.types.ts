import { Product } from '../models/product.schema';

export type CreateProductRecord = Omit<
  Product,
  'avgRating' | 'reviewCount' | 'createdAt' | 'updatedAt' | '_id' | 'categoryId'
> & { categoryId: string };

export type UpdateProductRecord = Partial<CreateProductRecord> & {
  avgRating?: number;
  reviewCount?: number;
};
