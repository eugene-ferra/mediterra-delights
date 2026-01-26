import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshSessionDocument = HydratedDocument<RefreshSession>;

@Schema({
  timestamps: true,
})
export class RefreshSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  deviceId!: string;

  @Prop({ required: true })
  refreshTokenHash!: string;

  @Prop({ default: '' })
  userAgent!: string;

  @Prop({ default: '' })
  ip!: string;

  @Prop({ default: () => new Date() })
  lastUsedAt!: Date;

  @Prop({ required: true })
  expiresAt!: Date;
}

export const RefreshSessionSchema =
  SchemaFactory.createForClass(RefreshSession);

RefreshSessionSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
RefreshSessionSchema.index({ deviceId: 1 });
RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
