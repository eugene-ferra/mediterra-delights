import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpsertSessionParams } from './types/refresh-session.types';
import { createHash } from 'crypto';
import { SessionRepository } from './repositories/session.repository';
import { SessionEntity } from './entities/session-entity.type';

@Injectable()
export class SessionsService {
  constructor(private readonly sessionRepo: SessionRepository) {}

  async upsertSession(params: UpsertSessionParams): Promise<SessionEntity> {
    const { refreshToken, userAgent, ip, expiresAt, userId, deviceId } = params;

    const pre = createHash('sha256').update(refreshToken).digest('hex');
    const refreshTokenHash = await bcrypt.hash(pre, 12);

    return await this.sessionRepo.upsertOne(
      { userId, deviceId },
      {
        refreshTokenHash,
        userAgent,
        ip,
        expiresAt,
      },
    );
  }

  async isSessionValid(
    session: SessionEntity,
    refreshToken: string,
  ): Promise<boolean> {
    const pre = createHash('sha256').update(refreshToken).digest('hex');

    const ok = await bcrypt.compare(pre, session.refreshTokenHash);
    if (!ok) return false;

    return true;
  }

  async findSession(userId: string, deviceId: string): Promise<SessionEntity> {
    const session = await this.sessionRepo.findOne(userId, deviceId);
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async removeSession(
    userId: string,
    deviceId: string,
  ): Promise<{ deleted: true }> {
    const res = await this.sessionRepo.deleteOne(userId, deviceId);

    if (!res) throw new NotFoundException('Session not found');

    return { deleted: true };
  }

  async removeAllSessions(userId: string): Promise<{ deletedCount: number }> {
    const deletedCount = await this.sessionRepo.deleteMany(userId);

    return { deletedCount: deletedCount ?? 0 };
  }

  async touch(userId: string, deviceId: string): Promise<{ updated: true }> {
    const res = await this.sessionRepo.updateUseTime(userId, deviceId);

    if (!res) throw new NotFoundException('Session not found');

    return { updated: true };
  }
}
