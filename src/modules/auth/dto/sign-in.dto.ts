import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsEmail()
  @MaxLength(60)
  email: string;

  @IsString()
  @Length(8, 15)
  password: string;
}
