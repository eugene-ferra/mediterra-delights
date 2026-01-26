export type SessionEntity = {
  id: string;
  userId: string;
  deviceId: string;
  refreshTokenHash: string;
  userAgent: string;
  ip: string;
  expiresAt: Date;
  lastUsedAt: Date;
};
