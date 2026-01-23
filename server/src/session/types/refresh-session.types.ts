import { Types } from 'mongoose';

export type MetaData = {
  devideId: string;
  userAgent?: string;
  ip?: string;
};

export type UpsertSessionParams = {
  userId: string;
  deviceId: string;
  refreshToken: string; // raw token
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
};

export type ValidateSessionParams = {
  userId: Types.ObjectId;
  deviceId: string;
  refreshToken: string; // raw token
};
