import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const VerifyPasswordSchema = z.object({
  confirmPassword: z.string().min(8).max(15),
});

export class VerifyPasswordDto extends createZodDto(VerifyPasswordSchema) {}
