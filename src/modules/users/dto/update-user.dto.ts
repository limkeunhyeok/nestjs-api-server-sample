import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { RoleEnum } from 'src/constants/enums/role.enum';

export class UpdateUserByIdDto {
  @IsOptional()
  @IsEnum(RoleEnum)
  role?: RoleEnum;

  @IsOptional()
  @IsString()
  @Length(8, 15)
  password?: string;
}
