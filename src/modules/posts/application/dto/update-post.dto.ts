import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const zodBooleanCoerce = z.preprocess((val) => {
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return val;
}, z.boolean());

export const UpdatePostSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  contents: z.string().optional(),
  published: zodBooleanCoerce.optional(),
});

export class UpdatePostDto extends createZodDto(UpdatePostSchema) {}
