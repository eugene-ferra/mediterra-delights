import { Types } from 'mongoose';

export type UserEntity = {
  id: Types.ObjectId;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  password?: string;
  avatar: {
    jpg?: string;
    webp?: string;
    avif?: string;
  };
  savedProducts: Types.ObjectId[];
  likedArticles: Types.ObjectId[];
  savedArticles: Types.ObjectId[];
  addedReviews: Types.ObjectId[];
  addedComments: Types.ObjectId[];
  cart: { id: Types.ObjectId; quantity: number }[];
  orders: Types.ObjectId[];
  resetToken?: string;
  resetTokenExpiresAt?: Date;
};
