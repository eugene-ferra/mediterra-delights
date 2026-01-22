import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ReviewStatus } from '../types/review-status.enum';

export type ReviewDocument = HydratedDocument<Review>;

@Schema()
export class Review {
  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  })
  productId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    trim: true,
    maxLength: 1000,
    default: '',
  })
  review?: string;

  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 5,
  })
  rating!: number;

  @Prop({
    type: String,
    enum: ReviewStatus,
    required: true,
    default: ReviewStatus.PENDING,
  })
  status!: ReviewStatus;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt!: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
