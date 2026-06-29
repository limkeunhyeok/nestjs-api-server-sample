import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RegisterSchema = z.object({
  email: z.string().email().max(60),
  password: z.string().min(8).max(15),
  name: z.string().min(1),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
