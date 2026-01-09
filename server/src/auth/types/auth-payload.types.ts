import { Types } from 'mongoose';

export type UserPayload = {
  _id: Types.ObjectId;
  role: 'user' | 'admin';
};

export type RefreshTokenPayload = {
  sub: string;
  deviceId: string;
};

export type UserTokens = {
  accessToken: string;
  refreshToken: string;
};
