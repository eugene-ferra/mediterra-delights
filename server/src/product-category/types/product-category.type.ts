import mongoose from 'mongoose';

export type ProductCategoryEntity = {
  id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  isActive: boolean;
};
