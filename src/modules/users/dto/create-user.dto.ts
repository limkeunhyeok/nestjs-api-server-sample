import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { Role } from 'src/common/constants/role.const';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  @MaxLength(60)
  email: string;

  @IsString()
  @Length(8, 15)
  password: string;

  @IsString()
  @MaxLength(60)
  name: string;

  @IsEnum(Role)
  @IsOptional()
  role: Role = Role.MEMBER;
}
