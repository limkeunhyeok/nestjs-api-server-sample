import { createZodDto } from 'nestjs-zod';
import { PaginateBaseSchema } from 'src/common/dtos/paginate.dto';
import { z } from 'zod';
import { PostEntity } from '../../infrastructure/persistence/post.orm-entity';

const POST_SORT_FIELDS: (keyof PostEntity)[] = [
  'id',
  'published',
  'createdAt',
  'updatedAt',
];

const zodBooleanCoerce = z.preprocess((val) => {
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return val;
}, z.boolean());

export const PaginatePostsSchema = PaginateBaseSchema.extend({
  authorId: z.coerce.number().optional(),
  published: zodBooleanCoerce.optional(),
})
  .refine(
    (data) => {
      return POST_SORT_FIELDS.includes(data.sortField as keyof PostEntity);
    },
    {
      message: `sortField must be one of: ${POST_SORT_FIELDS.join(', ')}`,
      path: ['sortField'],
    },
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate < data.endDate;
      }
      return true;
    },
    {
      message: 'startDate must be before endDate',
      path: ['startDate'],
    },
  );

export class PaginatePostsDto extends createZodDto(PaginatePostsSchema) {}
