import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

import { IsLessThan } from 'src/common/ validators/is-less-than.validator';

export class NutrientsDto {
  @IsOptional()
  @Min(0, { message: 'Calories must be more than 0.' })
  @IsNumber({}, { message: 'Calories must be a number.' })
  calories?: number;

  @IsOptional()
  @Min(0, { message: 'Carbohydrates must be more than 0.' })
  @IsNumber({}, { message: 'Carbohydrates must be a number.' })
  carbohydrates?: number;

  @IsOptional()
  @Min(0, { message: 'Protein must be more than 0.' })
  @IsNumber({}, { message: 'Protein must be a number.' })
  protein?: number;

  @IsOptional()
  @Min(0, { message: 'Fats must be more than 0.' })
  @IsNumber({}, { message: 'Fats must be a number.' })
  fats?: number;
}

export class UpdateProductDto {
  @IsOptional()
  @MinLength(2, { message: 'Title must be at least 2 characters long.' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters.' })
  @IsString()
  title?: string;

  @IsOptional()
  @IsMongoId({ message: 'categoryId must be a valid MongoDB ObjectId.' })
  categoryId?: string;

  @IsOptional()
  @MinLength(10, {
    message: 'Description must be at least 10 characters long.',
  })
  @IsString()
  description?: string;

  @IsOptional()
  @MaxLength(10000, { message: 'Full text cannot exceed 10000 characters.' })
  @IsString()
  fullText?: string;

  @IsOptional()
  @Min(0, { message: 'Weight must be more than 0.' })
  @IsNumber({}, { message: 'Weight must be a number.' })
  weight?: number;

  @IsOptional()
  @Min(0, { message: 'Price must be more than 0.' })
  @IsNumber({}, { message: 'Price must be a number.' })
  price?: number;

  @IsOptional()
  @Min(0, { message: 'Discount price must be more than 0.' })
  @IsNumber({}, { message: 'Discount price must be a number.' })
  @IsLessThan('price', {
    message: 'Discount price must be less than the regular price.',
  })
  discountPrice?: number;

  @IsOptional()
  @IsObject({ message: 'nutrients must be an object.' })
  @ValidateNested()
  @Type(() => NutrientsDto)
  nutrients?: NutrientsDto;

  @IsOptional()
  @IsBoolean({ message: 'isVegan must be a boolean value.' })
  isVegan?: boolean;

  @IsOptional()
  @Min(0, { message: 'Cook time must be more than 0.' })
  @IsNumber({}, { message: 'Cook time must be a number.' })
  cookTime?: number;

  @IsOptional()
  @IsBoolean({ message: 'isNewProduct must be a boolean value.' })
  isNewProduct?: boolean;

  @IsOptional()
  @IsArray({ message: 'Compound must be an array.' })
  @IsString({ each: true, message: 'Each compound item must be a string.' })
  compound?: string[];
}
