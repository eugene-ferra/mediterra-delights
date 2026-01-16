import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsMongoId({ message: 'Invalid product ID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId!: string;

  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  @IsNumber({}, { message: 'Rating must be a number' })
  @IsNotEmpty({ message: 'Rating is required' })
  rating!: number;

  @MaxLength(1000, { message: 'Review text must be at most 1000 characters' })
  @IsString({ message: 'Review text must be a string' })
  @IsNotEmpty({ message: 'Review text is required' })
  review?: string;
}
