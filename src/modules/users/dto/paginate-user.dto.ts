import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { Role } from '../user.entity';

export class PaginateUsersDto extends PaginateDto {
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
