import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateReviewDto {
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  @IsNumber({}, { message: 'Rating must be a number' })
  @IsOptional()
  rating!: number;

  @MaxLength(1000, { message: 'Review text must be at most 1000 characters' })
  @IsString({ message: 'Review text must be a string' })
  @IsOptional({})
  review?: string;
}
