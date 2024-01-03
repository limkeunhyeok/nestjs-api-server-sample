import { IsEnum, IsOptional } from 'class-validator';
import { CommonQueryDto } from 'src/common/dtos/common.dto';
import { RoleEnum } from 'src/constants/enums/role.enum';

export class GetUsersByQueryDto extends CommonQueryDto {
  @IsOptional()
  @IsEnum(RoleEnum)
  role?: RoleEnum;
}
