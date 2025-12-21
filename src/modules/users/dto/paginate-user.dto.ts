import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsSortableField } from 'src/common/decorators/is-sortable-field.decorator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { Role } from '../../../common/constants/role.const';
import { UserEntity } from '../user.entity';

const USER_SORT_FIELDS: Partial<keyof UserEntity>[] = [
  'id',
  'email',
  'name',
  'role',
  'latestTryLoginDate',
  'createdAt',
  'updatedAt',
];

export class PaginateUsersDto extends PaginateDto {
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsSortableField(USER_SORT_FIELDS)
  override sortField: string = 'createdAt';
}
