import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ default: '' })
  phone!: string;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role!: 'user' | 'admin';

  @Prop({ required: true })
  password?: string;

  @Prop({
    type: {
      jpg: { type: String },
      webp: { type: String },
      avif: { type: String },
    },
    _id: false, // do not create separate _id for avatar subdocument
    default: {},
  })
  avatar!: {
    jpg?: string;
    webp?: string;
    avif?: string;
  };

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    default: [],
  })
  savedProducts!: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    default: [],
  })
  likedArticles!: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    default: [],
  })
  savedArticles!: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    default: [],
  })
  addedReviews!: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    default: [],
  })
  addedComments!: mongoose.Types.ObjectId[];

  @Prop({
    type: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, default: 1 },
      },
    ],
    _id: false,
    default: [],
  })
  cart!: { id: mongoose.Types.ObjectId; quantity: number }[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    default: [],
  })
  orders!: mongoose.Types.ObjectId[];

  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create an index on the email field to enforce uniqueness at the database level
UserSchema.index({ email: 1 }, { unique: true });
