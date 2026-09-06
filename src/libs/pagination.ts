import { PaginationResponse } from 'src/common/interfaces/pagination.interface';

export const toPaginationResponse = <T>({
  total,
  limit,
  offset,
  data,
}: PaginationResponse<T>) => {
  return {
    total,
    limit: total > limit ? limit : total,
    offset,
    data,
  };
};
