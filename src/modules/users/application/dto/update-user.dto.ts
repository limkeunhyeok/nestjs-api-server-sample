import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Role } from 'src/common/constants/role.const';

export const UpdateUserByIdSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  password: z.string().min(8).max(15).optional(),
  name: z.string().max(60).optional(),
});

export class UpdateUserByIdDto extends createZodDto(UpdateUserByIdSchema) {}
