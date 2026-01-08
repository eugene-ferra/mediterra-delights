import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email!: string;

  @IsString({ message: 'Password must be a text value.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password!: string;
}
