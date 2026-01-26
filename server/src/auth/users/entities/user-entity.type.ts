import { Types } from 'mongoose';
import { UserRole } from '../types/user-role.enum';

export type UserEntity = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  avatar: {
    jpg?: string;
    webp?: string;
    avif?: string;
  };
  savedProducts: string[];
  likedArticles: string[];
  savedArticles: string[];
  addedReviews: string[];
  addedComments: string[];
  cart: { id: Types.ObjectId; quantity: number }[];
  orders: Types.ObjectId[];
  resetToken?: string;
  resetTokenExpiresAt?: Date;
};
``;
