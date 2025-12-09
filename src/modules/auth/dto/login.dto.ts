import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsEmail()
  @MaxLength(60)
  email: string;

  @IsString()
  @Length(8, 15)
  password: string;
}
