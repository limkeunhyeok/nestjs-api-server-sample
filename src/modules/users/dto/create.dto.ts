import { IsEmail, IsEnum, IsString, Length, MaxLength } from 'class-validator';
import { RoleEnum } from 'src/constants/enums/role.enum';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  @MaxLength(60)
  email: string;

  @IsString()
  @Length(8, 15)
  password: string;

  @IsEnum(RoleEnum)
  role: RoleEnum;
}
