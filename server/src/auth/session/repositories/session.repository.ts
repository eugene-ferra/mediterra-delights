import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RefreshSession,
  RefreshSessionDocument,
} from '../schema/refresh-session.schema';
import { Model, Types } from 'mongoose';
import { SessionEntity } from '../entities/session-entity.type';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(RefreshSession.name)
    private readonly sessionModel: Model<RefreshSession>,
  ) {}

  private toEntity(doc: RefreshSessionDocument): SessionEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      deviceId: doc.deviceId,
      refreshTokenHash: doc.refreshTokenHash,
      userAgent: doc.userAgent,
      ip: doc.ip,
      expiresAt: doc.expiresAt,
      lastUsedAt: doc.lastUsedAt,
    };
  }

  private isValidId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  async deleteOne(
    userId: string,
    deviceId: string,
  ): Promise<SessionEntity | null> {
    if (!this.isValidId(userId)) return null;

    const result = await this.sessionModel.findOneAndDelete({
      userId,
      deviceId,
    });

    return result ? this.toEntity(result) : null;
  }

  async deleteMany(userId: string): Promise<number | null> {
    const res = await this.sessionModel.deleteMany({ userId });

    return res.deletedCount;
  }

  async updateUseTime(
    userId: string,
    deviceId: string,
  ): Promise<SessionEntity | null> {
    const res = await this.sessionModel.findOneAndUpdate(
      { userId, deviceId },
      { $set: { lastUsedAt: new Date() } },
      { new: true },
    );

    if (!res) return null;
    return this.toEntity(res);
  }

  async findOne(
    userId: string,
    deviceId: string,
  ): Promise<SessionEntity | null> {
    const session = await this.sessionModel.findOne({ userId, deviceId });

    if (!session) return null;
    return this.toEntity(session);
  }

  async upsertOne(
    filter: { userId: string; deviceId: string },
    updateData: Partial<RefreshSession>,
  ): Promise<SessionEntity> {
    const updatedSession = await this.sessionModel.findOneAndUpdate(
      { userId: filter.userId, deviceId: filter.deviceId },
      {
        $set: {
          refreshTokenHash: updateData.refreshTokenHash,
          userAgent: updateData.userAgent ?? '',
          ip: updateData.ip ?? '',
          expiresAt: updateData.expiresAt,
          lastUsedAt: new Date(),
        },
      },
      { new: true, upsert: true },
    );
    return this.toEntity(updatedSession);
  }
}
