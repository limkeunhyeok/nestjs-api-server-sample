import { IsString, Length } from 'class-validator';

export class VerifyPasswordDto {
  @IsString()
  @Length(8, 15)
  confirmPassword: string;
}
