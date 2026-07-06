import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PaginateBaseSchema } from 'src/common/dtos/paginate.dto';
import { Role } from 'src/common/constants/role.const';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/entities/user.orm-entity';

const USER_SORT_FIELDS: (keyof UserEntity)[] = [
  'id',
  'email',
  'name',
  'role',
  'latestTryLoginDate',
  'createdAt',
  'updatedAt',
];

export const PaginateUsersSchema = PaginateBaseSchema.extend({
  role: z.nativeEnum(Role).optional(),
  name: z.string().min(1).optional(),
})
  .refine(
    (data) => {
      return USER_SORT_FIELDS.includes(data.sortField as keyof UserEntity);
    },
    {
      message: `sortField must be one of: ${USER_SORT_FIELDS.join(', ')}`,
      path: ['sortField'],
    },
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate < data.endDate;
      }
      return true;
    },
    {
      message: 'startDate must be before endDate',
      path: ['startDate'],
    },
  );

export class PaginateUsersDto extends createZodDto(PaginateUsersSchema) {}
