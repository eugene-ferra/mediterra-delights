import { IsBoolean, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateProductCategoryDto {
  @MaxLength(50, { message: 'Title cannot exceed 50 characters.' })
  @MinLength(2, { message: 'Title must be at least 2 characters long.' })
  @IsNotEmpty({ message: 'Title is required.' })
  title!: string;

  @IsBoolean({ message: 'isActive must be a boolean value.' })
  @IsNotEmpty({ message: 'isActive is required.' })
  isActive!: boolean;
}
