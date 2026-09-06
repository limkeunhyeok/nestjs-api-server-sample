import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Role } from 'src/common/constants/role.const';

export const CreateDevTokenSchema = z.object({
  name: z.string().min(1),
  role: z.nativeEnum(Role).optional(),
  expiresIn: z.string().optional(),
});

export class CreateDevTokenDto extends createZodDto(CreateDevTokenSchema) {}
