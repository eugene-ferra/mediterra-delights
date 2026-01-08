import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { RefreshSession } from '../schema/refresh-session.schema';
import {
  UpsertSessionParams,
  ValidateSessionParams,
} from '../types/refresh-session.types';

@Injectable()
export class RefreshSessionsService {
  constructor(
    @InjectModel(RefreshSession.name)
    private readonly sessionModel: Model<RefreshSession>,
  ) {}

  async upsertSession(params: UpsertSessionParams): Promise<RefreshSession> {
    const refreshTokenHash = await bcrypt.hash(params.refreshToken, 12);

    const session = await this.sessionModel.findOneAndUpdate(
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

    return session.toObject();
  }

  async validateSession(
    params: ValidateSessionParams,
  ): Promise<RefreshSession | null> {
    const session = await this.sessionModel
      .findOne({
        userId: params.userId,
        deviceId: params.deviceId,
      })
      .lean();

    if (!session) return null;

    const ok = await bcrypt.compare(
      params.refreshToken,
      session.refreshTokenHash,
    );
    if (!ok) return null;

    return session;
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
