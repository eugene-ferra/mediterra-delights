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

const toInt = (v: unknown) => (v === undefined ? undefined : Number(v));
const toBool = (v: unknown) => {
  if (v === undefined) return undefined;
  if (v === true || v === false) return v;
  const s = String(v).toLowerCase().trim();
  if (s === 'true' || s === '1') return true;
  if (s === 'false' || s === '0') return false;
  return v;
};
const toNum = (v: unknown) => (v === undefined ? undefined : Number(v));

export class FindManyProductsQueryDto {
  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => toInt(value))
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
  @Transform(({ value }) => toNum(value))
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @IsString()
  q?: string;
}
