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
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

import { IsLessThan } from 'src/common/ validators/is-less-than.validator';

export class NutrientsDto {
  @Min(0, {
    message: 'Please enter a value greater than or equal to 0 for calories.',
  })
  @IsNumber({}, { message: 'Please enter a valid number for calories.' })
  @IsOptional()
  calories?: number;

  @Min(0, {
    message:
      'Please enter a value greater than or equal to 0 for carbohydrates.',
  })
  @IsNumber({}, { message: 'Please enter a valid number for carbohydrates.' })
  @IsOptional()
  carbohydrates?: number;

  @Min(0, {
    message: 'Please enter a value greater than or equal to 0 for protein.',
  })
  @IsNumber({}, { message: 'Please enter a valid number for protein.' })
  @IsOptional()
  protein?: number;

  @Min(0, {
    message: 'Please enter a value greater than or equal to 0 for fats.',
  })
  @IsNumber({}, { message: 'Please enter a valid number for fats.' })
  @IsOptional()
  fats?: number;
}

export class CreateProductDto {
  @MinLength(2, {
    message: 'Title too short. Please enter at least 2 characters.',
  })
  @MaxLength(100, {
    message: 'Title too long. Please enter no more than 100 characters.',
  })
  @IsNotEmpty({ message: 'Please enter a title.' })
  title!: string;

  @IsMongoId({ message: 'Please choose a valid category.' })
  @IsNotEmpty({ message: 'Please choose a category.' })
  categoryId!: string;

  @MinLength(10, {
    message: 'Description too short. Please enter at least 10 characters.',
  })
  @MaxLength(3000, {
    message: 'Description too long. Please enter no more than 3000 characters.',
  })
  @IsString({ message: 'Please enter a valid description.' })
  @IsNotEmpty({ message: 'Please enter a description.' })
  description!: string;

  @MinLength(10, {
    message: 'Full information too short. Please enter at least 10 characters.',
  })
  @MaxLength(10000, {
    message:
      'Full information too long. Please enter no more than 10000 characters.',
  })
  @IsString({ message: 'Please enter valid full information.' })
  @IsOptional()
  fullText?: string;

  @Min(0, {
    message: 'Please enter a value greater than or equal to 0 for weight.',
  })
  @IsNumber({}, { message: 'Please enter a valid number for weight.' })
  @IsNotEmpty({ message: 'Please enter a weight.' })
  weight!: number;

  @Min(0, {
    message: 'Please enter a value greater than or equal to 0 for price.',
  })
  @IsNumber({}, { message: 'Please enter a valid number for price.' })
  @IsNotEmpty({ message: 'Please enter a price.' })
  price!: number;

  @IsLessThan('price', {
    message: 'Discount price must be less than the regular price.',
  })
  @Min(0, {
    message:
      'Please enter a value greater than or equal to 0 for discount price.',
  })
  @IsNumber({}, { message: 'Please enter a valid number for discount price.' })
  @IsOptional()
  discountPrice?: number;

  @IsObject({ message: 'Please enter a valid nutrients information.' })
  @ValidateNested()
  @Type(() => NutrientsDto)
  @IsOptional()
  nutrients?: NutrientsDto;

  @IsBoolean({ message: 'Please mark if the product is vegan or not.' })
  @IsNotEmpty({ message: 'Please specify if the product is vegan or not.' })
  isVegan!: boolean;

  @Min(0, {
    message: 'Please enter a value greater than or equal to 0 for cook time.',
  })
  @IsNumber({}, { message: 'Please enter a valid number for cook time.' })
  @IsNotEmpty({ message: 'Please enter a cook time.' })
  cookTime!: number;

  @IsBoolean({ message: 'Please mark if the product is new or not.' })
  @IsNotEmpty({ message: 'Please specify if the product is new or not.' })
  isNewProduct!: boolean;

  @IsArray({ message: 'Please enter a valid array for compound.' })
  @IsString({
    each: true,
    message: 'Please enter valid information for each compound item.',
  })
  @IsOptional()
  compound?: string[];

  @IsBoolean({ message: 'Please mark if the product is active or not.' })
  @IsNotEmpty({ message: 'Please specify if the product is active or not.' })
  isActive!: boolean;
}
