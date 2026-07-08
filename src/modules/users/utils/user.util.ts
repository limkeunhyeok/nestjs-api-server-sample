import { isNil } from 'lodash';
import { Role } from 'src/common/constants/role.const';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import {
  DEFAULT_TTL,
  FIRST_PAGE_TTL,
  WITH_FILTER_PAGE_TTL,
} from '../constants/user.const';

export function getTTL(params: {
  role?: Role;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  limit: number;
  offset: number;
  sortField: string;
  sortDirection: SortDirection;
}) {
  const { offset, role, name } = params;

  // 첫 페이지이고 필터가 없으면 가장 길게 캐싱
  if (offset === 0 && isNil(role) && isNil(name)) {
    return FIRST_PAGE_TTL;
  }

  // 필터가 있는 경우
  if (role || name) {
    return WITH_FILTER_PAGE_TTL;
  }

  return DEFAULT_TTL;
}
