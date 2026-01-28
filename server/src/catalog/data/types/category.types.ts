import { Category } from '../models/category.schema';

export type CreateCategoryRecord = Omit<Category, '_id'>;

export type UpdateCategoryRecord = Partial<CreateCategoryRecord>;
