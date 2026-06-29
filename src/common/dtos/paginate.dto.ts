import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const SortDirection = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];

export const PaginateBaseSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(0).default(10000),
  offset: z.coerce.number().int().min(0).default(0),
  sortField: z.string().default('createdAt'),
  sortDirection: z.nativeEnum(SortDirection).default(SortDirection.DESC),
});

export const PaginateSchema = PaginateBaseSchema.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'startDate must be before endDate',
    path: ['startDate'],
  },
);

export class PaginateDto extends createZodDto(PaginateSchema) {}
