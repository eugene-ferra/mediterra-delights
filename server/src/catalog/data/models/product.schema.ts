import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: false })
export class ImageSet {
  @Prop({ required: true })
  jpg!: string;

  @Prop({ required: true })
  webp!: string;

  @Prop({ required: true })
  avif!: string;
}
export const ImageSetSchema = SchemaFactory.createForClass(ImageSet);

@Schema({ _id: false })
export class OptionalImageSet {
  @Prop()
  jpg?: string;

  @Prop()
  webp?: string;

  @Prop()
  avif?: string;
}
export const OptionalImageSetSchema =
  SchemaFactory.createForClass(OptionalImageSet);

@Schema({ _id: false })
export class Nutrients {
  @Prop()
  calories?: number;

  @Prop()
  carbohydrates?: number;

  @Prop()
  protein?: number;

  @Prop()
  fats?: number;
}
export const NutrientsSchema = SchemaFactory.createForClass(Nutrients);

@Schema({})
export class Product {
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

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ trim: true })
  fullText?: string;

  @Prop({ default: 0 })
  avgRating!: number;

  @Prop({ default: 0 })
  reviewCount!: number;

  @Prop({ type: ImageSetSchema, required: true })
  imgCover!: ImageSet;

  @Prop({ type: [OptionalImageSetSchema], default: [] })
  images!: OptionalImageSet[];

  @Prop({ required: true })
  weight!: number;

  @Prop({ required: true })
  price!: number;

  @Prop()
  discountPrice?: number;

  @Prop({ type: NutrientsSchema, default: {} })
  nutrients!: Nutrients;

  @Prop({
    required: [true, 'Product must have a isVegan prorerty!'],
  })
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
