import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const zodBooleanCoerce = z.preprocess((val) => {
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return val;
}, z.boolean());

export const CreateCommentSchema = z.object({
  contents: z.string(),
  published: zodBooleanCoerce.default(true),
});

export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}
