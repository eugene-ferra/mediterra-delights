import { Types } from 'mongoose';
import { Product } from '../models/product.schema';
import { Category } from '../models/category.schema';

export type CategoryLean = Category & {
  _id: Types.ObjectId;
};
export type ProductLeanWithCategory = Omit<Product, 'categoryId'> & {
  _id: Types.ObjectId;
  categoryId: CategoryLean;
};

export type CreateProductRecord = Omit<
  Product,
  'avgRating' | 'reviewCount' | 'categoryId' | 'createdAt' | 'updatedAt'
> & {
  categoryId: string;
};

export type UpdateProductRecord = Partial<CreateProductRecord> & {
  avgRating?: number;
  reviewCount?: number;
};
