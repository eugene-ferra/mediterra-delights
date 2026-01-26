import { UserRole } from 'src/auth/users/types/user-role.enum';

export type UserPayload = {
  _id: string;
  role: UserRole;
};

export type RefreshTokenPayload = {
  sub: string;
  deviceId: string;
};

export type UserTokens = {
  accessToken: string;
  refreshToken: string;
};
