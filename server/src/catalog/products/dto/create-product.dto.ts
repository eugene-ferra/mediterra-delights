import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
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

export class CreateProductDto {
  @MinLength(2, { message: 'Title must be at least 2 characters long.' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters.' })
  @IsNotEmpty({ message: 'Title is required.' })
  title!: string;

  @IsNotEmpty({ message: 'categoryId is required.' })
  @IsString({ message: 'categoryId must be a string.' })
  categoryId!: string;

  @MinLength(10, {
    message: 'Description must be at least 10 characters long.',
  })
  @IsNotEmpty({ message: 'Description is required.' })
  description!: string;

  @IsOptional()
  @MaxLength(10000, { message: 'Full text cannot exceed 10000 characters.' })
  @IsString()
  fullText?: string;

  @Min(0, { message: 'Weight must be more than 0.' })
  @IsNumber({}, { message: 'Weight must be a number.' })
  @IsNotEmpty({ message: 'Weight is required.' })
  weight!: number;

  @Min(0, { message: 'Price must be more than 0.' })
  @IsNumber({}, { message: 'Price must be a number.' })
  @IsNotEmpty({ message: 'Price is required.' })
  price!: number;

  @IsOptional()
  @IsLessThan('price', {
    message: 'Discount price must be less than the regular price.',
  })
  @Min(0, { message: 'Discount price must be more than 0.' })
  @IsNumber({}, { message: 'Discount price must be a number.' })
  discountPrice?: number;

  @IsOptional()
  @IsObject({ message: 'nutrients must be an object.' })
  @ValidateNested()
  @Type(() => NutrientsDto)
  nutrients?: NutrientsDto;

  @IsBoolean({ message: 'isVegan must be a boolean value.' })
  @IsNotEmpty({ message: 'isVegan is required.' })
  isVegan!: boolean;

  @Min(0, { message: 'Cook time must be more than 0.' })
  @IsNumber({}, { message: 'Cook time must be a number.' })
  @IsNotEmpty({ message: 'Cook time is required.' })
  cookTime!: number;

  @IsBoolean({ message: 'isNewProduct must be a boolean value.' })
  @IsNotEmpty({ message: 'isNewProduct is required.' })
  isNewProduct!: boolean;

  @IsOptional()
  @IsArray({ message: 'Compound must be an array.' })
  @IsString({ each: true, message: 'Each compound item must be a string.' })
  compound?: string[];
}
