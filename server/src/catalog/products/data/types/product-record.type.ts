import { ImageSet, OptionalImageSet } from 'src/common/types/image-set.type';
import { Nutrients } from 'src/common/types/nutrients.type';

export type ProductRecord = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  description: string;
  fullText?: string;
  avgRating: number;
  reviewCount: number;
  imgCover: ImageSet;
  images?: OptionalImageSet[];
  weight: number;
  price: number;
  discountPrice?: number;
  nutrients?: Nutrients;
  isVegan: boolean;
  cookTime: number;
  isNewProduct: boolean;
  compound?: string[];
};

export type CreateProductRecord = Omit<
  ProductRecord,
  'id' | 'avgRating' | 'reviewCount'
>;

export type UpdateProductRecord = Partial<CreateProductRecord>;
