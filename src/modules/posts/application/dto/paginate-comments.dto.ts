import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PaginateBaseSchema } from 'src/common/dtos/paginate.dto';
import { CommentEntity } from '../../infrastructure/persistence/comment.orm-entity';

const COMMENT_SORT_FIELDS: (keyof CommentEntity)[] = [
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

export const PaginateCommentsSchema = PaginateBaseSchema.extend({
  authorId: z.coerce.number().optional(),
  published: zodBooleanCoerce.optional(),
})
  .refine(
    (data) => {
      return COMMENT_SORT_FIELDS.includes(
        data.sortField as keyof CommentEntity,
      );
    },
    {
      message: `sortField must be one of: ${COMMENT_SORT_FIELDS.join(', ')}`,
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

export class PaginateCommentsDto extends createZodDto(PaginateCommentsSchema) {}
