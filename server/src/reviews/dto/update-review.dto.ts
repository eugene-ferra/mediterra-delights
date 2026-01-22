import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateReviewDto {
  @Min(1, { message: 'Please provide a rating of at least 1' })
  @Max(5, { message: 'Please provide a rating of at most 5' })
  @IsNumber({}, { message: 'Please provide a valid number for rating' })
  @IsOptional()
  rating!: number;

  @MaxLength(1000, {
    message:
      'Review is too long. Please shorten it to 1000 characters or less.',
  })
  @IsString({ message: 'Please provide a valid review text' })
  @IsOptional()
  review?: string;
}
