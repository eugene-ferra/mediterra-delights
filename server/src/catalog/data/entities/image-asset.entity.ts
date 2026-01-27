import { ImageVariantEntity } from './image-variant.entity';

export type ImageAssetEntity = {
  originalKey: string;
  originalWidth: number;
  originalHeight: number;
  rendetions?: Map<string, ImageVariantEntity>;
};
