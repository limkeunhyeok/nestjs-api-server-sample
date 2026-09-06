import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ForgotPasswordSchema = z.object({
  email: z.string().email().max(60),
});

export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}
