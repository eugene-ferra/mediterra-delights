import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ImageAsset, ImageAssetSchema } from './image-asset.schema';
import { Nutrients, NutrientsSchema } from './nutrients.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({})
export class Product {
  @Prop()
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, trim: true })
  slug!: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  })
  categoryId!: Types.ObjectId;

  @Prop({ required: true })
  isCategoryActive!: boolean;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ trim: true })
  fullText?: string;

  @Prop({ default: 0 })
  avgRating!: number;

  @Prop({ default: 0 })
  reviewCount!: number;

  @Prop({ type: ImageAssetSchema, required: true })
  imgCover!: ImageAsset;

  @Prop({ type: [ImageAssetSchema], default: [] })
  images?: ImageAsset[];

  @Prop({ required: true })
  weight!: number;

  @Prop({ required: true })
  price!: number;

  @Prop()
  discountPrice?: number;

  @Prop({ type: NutrientsSchema, default: {} })
  nutrients!: Nutrients;

  @Prop({ required: true })
  isVegan!: boolean;

  @Prop({ required: true })
  cookTime!: number;

  @Prop()
  isNewProduct!: boolean;

  @Prop({ type: [String], default: [] })
  compound?: string[];

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index(
  { title: 'text', description: 'text', fullText: 'text' },
  {
    name: 'products_text_idx',
    weights: { title: 10, description: 4, fullText: 1 },
    default_language: 'english',
  },
);
