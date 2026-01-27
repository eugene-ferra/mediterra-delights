import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ImageRendition } from '../enums/image-rendition.enum';
import { ImageVariant, ImageVariantSchema } from './image-variant.schema';

@Schema({ _id: false })
export class ImageAsset {
  @Prop({ required: true })
  originalKey!: string;

  @Prop({ required: true })
  originalWidth!: number;

  @Prop({ required: true })
  originalHeight!: number;

  @Prop({ type: Map, of: ImageVariantSchema, default: {} })
  renditions?: Map<ImageRendition, ImageVariant>;
}

export const ImageAssetSchema = SchemaFactory.createForClass(ImageAsset);
