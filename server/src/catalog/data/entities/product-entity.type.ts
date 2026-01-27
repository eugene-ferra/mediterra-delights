import { Nutrients } from 'src/common/types/nutrients.type';
import { CategoryEntity } from './category-entity.type';
import { ImageAssetEntity } from './image-asset.entity';

export type ProductEntity = {
  id: string;
  title: string;
  slug: string;
  category: CategoryEntity;
  description: string;
  fullText?: string;
  avgRating: number;
  reviewCount: number;
  imgCover: ImageAssetEntity;
  images: ImageAssetEntity[];
  weight: number;
  price: number;
  discountPrice?: number;
  nutrients?: Nutrients;
  isVegan: boolean;
  cookTime: number;
  isNewProduct: boolean;
  compound?: string[];
};
