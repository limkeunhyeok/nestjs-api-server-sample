import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { Role } from 'src/common/constants/role.const';

export class UpdateUserByIdDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  @Length(8, 15)
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;
}
