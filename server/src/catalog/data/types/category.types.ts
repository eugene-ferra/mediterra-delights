import { Category } from '../models/category.schema';

export type CreateCategoryRecord = Category;

export type UpdateCategoryRecord = Partial<CreateCategoryRecord>;
