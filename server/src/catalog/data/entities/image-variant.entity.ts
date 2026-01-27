import { ImageStatus } from '../enums/image-status.enum';

export type ImageVariantEntity = {
  jpgKey?: string;
  webpKey?: string;
  avifKey?: string;
  width: number;
  height: number;
  status: ImageStatus;
  blurDataUrl?: string;
};
