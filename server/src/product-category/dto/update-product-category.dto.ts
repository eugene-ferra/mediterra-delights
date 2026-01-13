import { IsBoolean, MaxLength, MinLength } from 'class-validator';

export class UpdateProductCategoryDto {
  @MaxLength(50, { message: 'Title cannot exceed 50 characters.' })
  @MinLength(2, { message: 'Title must be at least 2 characters long.' })
  title?: string;

  @IsBoolean({ message: 'isActive must be a boolean value.' })
  isActive?: boolean;
}
