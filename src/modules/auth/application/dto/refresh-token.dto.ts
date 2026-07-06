import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RefreshTokensSchema = z.object({
  refreshToken: z.string(),
});

export class RefreshTokensDto extends createZodDto(RefreshTokensSchema) {}
