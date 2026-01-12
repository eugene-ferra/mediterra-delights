import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { RefreshSession } from './schema/refresh-session.schema';
import {
  UpsertSessionParams,
  ValidateSessionParams,
} from './types/refresh-session.types';
import { createHash } from 'crypto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(RefreshSession.name)
    private readonly sessionModel: Model<RefreshSession>,
  ) {}

  async upsertSession(params: UpsertSessionParams): Promise<void> {
    const pre = createHash('sha256').update(params.refreshToken).digest('hex');
    const refreshTokenHash = await bcrypt.hash(pre, 12);

    await this.sessionModel.findOneAndUpdate(
      { userId: params.userId, deviceId: params.deviceId },
      {
        $set: {
          refreshTokenHash,
          userAgent: params.userAgent ?? '',
          ip: params.ip ?? '',
          expiresAt: params.expiresAt,
          lastUsedAt: new Date(),
        },
      },
      { new: true, upsert: true },
    );
  }

  async validateSession(
    params: ValidateSessionParams,
  ): Promise<RefreshSession | null> {
    const session = await this.sessionModel.findOne({
      userId: params.userId,
      deviceId: params.deviceId,
    });

    if (!session) return null;

    const pre = createHash('sha256').update(params.refreshToken).digest('hex');

    const ok = await bcrypt.compare(pre, session.refreshTokenHash);
    if (!ok) return null;

    return session.toObject();
  }

  async removeSession(userId: Types.ObjectId, deviceId: string): Promise<void> {
    await this.sessionModel.deleteOne({ userId, deviceId });
  }

  async removeAllSessions(userId: Types.ObjectId): Promise<void> {
    await this.sessionModel.deleteMany({ userId });
  }

  async touch(userId: Types.ObjectId, deviceId: string): Promise<void> {
    await this.sessionModel.updateOne(
      { userId, deviceId },
      { $set: { lastUsedAt: new Date() } },
    );
  }
}
