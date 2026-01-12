import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;

@Schema()
export class ProductCategory {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true, unique: true, index: true })
  slug!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);

ProductCategorySchema.index({ slug: 1 }, { unique: true });
ProductCategorySchema.index({ title: 1 });
