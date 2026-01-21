import { IsBoolean, MaxLength, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @MaxLength(50, { message: 'Title too long. Please shorten it.' })
  @MinLength(2, { message: 'Title too short. Please lengthen it.' })
  title?: string;

  @IsBoolean({ message: 'Please, mark category as active or inactive.' })
  isActive?: boolean;
}
