import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @MaxLength(50, { message: 'Name cannot exceed 50 characters.' })
  @MinLength(2, { message: 'Name must be at least 2 characters long.' })
  @IsNotEmpty({ message: 'Name is required.' })
  name!: string;

  @MaxLength(50, { message: 'Last name cannot exceed 50 characters.' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long.' })
  @IsNotEmpty({ message: 'Last name is required.' })
  lastName!: string;

  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;

  @IsOptional()
  @IsPhoneNumber(undefined, {
    message: 'Please enter a valid phone number.',
  })
  phone?: string;
}
