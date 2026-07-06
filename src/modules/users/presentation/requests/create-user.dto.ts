import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Role } from 'src/common/constants/role.const';

export const CreateUserSchema = z.object({
  email: z.string().email().max(60),
  password: z.string().min(8).max(15),
  name: z.string().max(60),
  role: z.nativeEnum(Role).default(Role.MEMBER),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
