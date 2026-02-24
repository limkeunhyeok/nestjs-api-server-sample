import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/common/constants/role.const';

export class CreateDevTokenDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum(Object.values(Role))
  role?: Role;

  @IsOptional()
  @IsString()
  expiresIn?: string;
}
