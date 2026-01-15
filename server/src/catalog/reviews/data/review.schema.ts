import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
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
  review!: string;

  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 5,
  })
  rating!: number;

  @Prop({
    type: Boolean,
    default: false,
    index: true,
  })
  isModerated!: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
