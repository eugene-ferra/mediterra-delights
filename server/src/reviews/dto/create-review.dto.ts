import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsMongoId({ message: 'Please provide a valid product id' })
  @IsNotEmpty({ message: 'Please specify a product' })
  productId!: string;

  @Min(1, { message: 'Please provide a rating of at least 1' })
  @Max(5, { message: 'Please provide a rating of at most 5' })
  @IsNumber({}, { message: 'Please provide a valid number for rating' })
  @IsNotEmpty({ message: 'Please provide a rating' })
  rating!: number;

  @MaxLength(1000, {
    message:
      'Review is too long. Please shorten it to 1000 characters or less.',
  })
  @IsString({ message: 'Please provide a valid review text' })
  @IsOptional()
  review?: string;
}
