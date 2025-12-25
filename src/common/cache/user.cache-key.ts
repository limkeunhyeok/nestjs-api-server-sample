import { hashString } from 'src/libs/cache';
import { Role } from '../constants/role.const';
import { SortDirection } from '../dtos/paginate.dto';

export const buildUsersPaginationCacheKey = (params: {
  role?: Role;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  limit: number;
  offset: number;
  sortField: string;
  sortDirection: SortDirection;
}) =>
  `users:pagination:${hashString(JSON.stringify(params, Object.keys(params).sort()), 16)}`;

export const buildUserByIdCacheKey = (userId: number | string) =>
  `users:id:${userId}`;
