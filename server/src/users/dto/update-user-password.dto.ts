import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Old password is required.' })
  oldPassword!: string;

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
  newPassword!: string;
}
