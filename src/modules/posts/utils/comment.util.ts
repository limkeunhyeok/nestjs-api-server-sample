import { isNil } from 'lodash';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import {
  DEFAULT_TTL,
  FIRST_PAGE_TTL,
  WITH_FILTER_PAGE_TTL,
} from '../constans/comment.const';

export function getTTL(params: {
  authorId?: number;
  postId?: number;
  published?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit: number;
  offset: number;
  sortField: string;
  sortDirection: SortDirection;
}) {
  const { offset, authorId, postId, published } = params;

  // 첫 페이지이고 필터가 없으면 가장 길게 캐싱
  if (offset === 0 && isNil(authorId) && isNil(published) && isNil(postId)) {
    return FIRST_PAGE_TTL;
  }

  // 필터가 있는 경우
  if (authorId || !isNil(published)) {
    return WITH_FILTER_PAGE_TTL;
  }

  return DEFAULT_TTL;
}
