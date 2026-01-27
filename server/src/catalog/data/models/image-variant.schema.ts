import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ImageStatus } from '../enums/image-status.enum';

@Schema({ _id: false })
export class ImageVariant {
  @Prop()
  jpgKey?: string;

  @Prop()
  webpKey?: string;

  @Prop()
  avifKey?: string;

  @Prop({ required: true })
  width!: number;

  @Prop({ required: true })
  height!: number;

  @Prop({ enum: ImageStatus, default: ImageStatus.PENDING })
  status!: ImageStatus;

  @Prop()
  blurDataUrl?: string;
}

export const ImageVariantSchema = SchemaFactory.createForClass(ImageVariant);
