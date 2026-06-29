import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const LoginSchema = z.object({
  email: z.string().email().max(60),
  password: z.string().min(8).max(15),
});

export class LoginDto extends createZodDto(LoginSchema) {}
