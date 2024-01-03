interface PagingResponse<T> {
  total: number;
  limit: number;
  offset: number;
  data: T;
}

export const pagingResponse = <T>({
  total,
  limit,
  offset,
  data,
}: PagingResponse<T>) => {
  return {
    total,
    limit: total > limit ? limit : total,
    offset,
    data,
  };
};
