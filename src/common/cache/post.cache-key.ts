import { hashString } from 'src/libs/cache';
import { SortDirection } from '../dtos/paginate.dto';

export const buildPostsPaginationCacheKey = (params: {
  authorId?: number;
  published?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit: number;
  offset: number;
  sortField: string;
  sortDirection: SortDirection;
}) =>
  `posts:pagination:${hashString(JSON.stringify(params, Object.keys(params).sort()), 16)}`;

export const buildPostByIdCacheKey = (userId: number | string) =>
  `posts:id:${userId}`;
