import { IsBoolean, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @MaxLength(50, { message: 'Title too long. Please shorten it.' })
  @MinLength(2, { message: 'Title too short. Please lengthen it.' })
  @IsNotEmpty({ message: 'Please provide a title for the category.' })
  title!: string;

  @IsBoolean({ message: 'Please, mark new category as active or inactive.' })
  @IsNotEmpty({ message: 'Please, mark new category as active or inactive.' })
  isActive!: boolean;
}
