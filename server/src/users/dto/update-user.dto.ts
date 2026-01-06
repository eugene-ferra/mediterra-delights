import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @MinLength(2, { message: 'Name must be from 2 to 20 characters long.' })
  @MaxLength(20, { message: 'Name must be from 2 to 20 characters long.' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be from 2 to 50 characters long.' })
  @MaxLength(50, { message: 'Last name must be from 2 to 50 characters long.' })
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, {
    message: 'Please enter a valid phone number.',
  })
  phone?: string;
}
