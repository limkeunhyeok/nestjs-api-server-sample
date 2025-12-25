import { hashString } from 'src/libs/cache';
import { SortDirection } from '../dtos/paginate.dto';

export const buildCommentsPaginationCacheKey = (params: {
  authorId?: number;
  published?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit: number;
  offset: number;
  sortField: string;
  sortDirection: SortDirection;
}) =>
  `comments:pagination:${hashString(JSON.stringify(params, Object.keys(params).sort()), 16)}`;

export const buildCommentByIdCacheKey = (commentId: number | string) =>
  `comments:id:${commentId}`;
