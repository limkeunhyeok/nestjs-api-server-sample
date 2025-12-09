import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { Role } from '../../../common/constants/role.const';

export class PaginateUsersDto extends PaginateDto {
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
