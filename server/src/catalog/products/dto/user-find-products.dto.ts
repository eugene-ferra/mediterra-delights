import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { toNum } from 'src/common/ validators/to-num';
import { toBool } from 'src/common/ validators/to-bool';

export class UserFindProductsDto {
  @IsOptional()
  @Transform(({ value }) => toNum(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => toNum(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsIn(['createdAt', 'price', 'avgRating', 'reviewCount', 'title'])
  sortBy?: 'createdAt' | 'price' | 'avgRating' | 'reviewCount' | 'title';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  isVegan?: boolean;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  isNewProduct?: boolean;

  @IsOptional()
  @Transform(({ value }) => toNum(value))
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => toNum(value))
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  q?: string;
}
