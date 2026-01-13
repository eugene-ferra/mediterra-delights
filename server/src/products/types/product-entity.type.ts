import { Types } from 'mongoose';

class ImageSet {
  jpg!: string;
  webp!: string;
  avif!: string;
}

class OptionalImageSet {
  jpg?: string;
  webp?: string;
  avif?: string;
}

class Nutrients {
  calories?: number;
  carbohydrates?: number;
  protein?: number;
  fats?: number;
}

export class ProductEntity {
  id!: Types.ObjectId;
  title!: string;
  slug!: string;
  category!: {
    id: Types.ObjectId;
    title: string;
    slug: string;
  };
  description!: string;
  fullText?: string;
  avgRating!: number;
  reviewCount!: number;
  imgCover!: ImageSet;
  images!: OptionalImageSet[];
  weight!: number;
  price!: number;
  discountPrice?: number;
  nutrients?: Nutrients;
  isVegan!: boolean;
  cookTime!: number;
  isNewProduct?: boolean;
  compound?: string[];
}
