import { ImageSet, OptionalImageSet } from 'src/common/types/image-set.type';
import { Nutrients } from 'src/common/types/nutrients.type';

export type ProductEntity = {
  id: string;
  title: string;
  slug: string;
  category: {
    id: string;
    title: string;
    slug: string;
  };
  description: string;
  fullText?: string;
  avgRating: number;
  reviewCount: number;
  imgCover: ImageSet;
  images: OptionalImageSet[];
  weight: number;
  price: number;
  discountPrice?: number;
  nutrients?: Nutrients;
  isVegan: boolean;
  cookTime: number;
  isNewProduct: boolean;
  compound?: string[];
};
