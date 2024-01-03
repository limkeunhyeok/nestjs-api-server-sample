import { And, LessThanOrEqual, MoreThan } from 'typeorm';

export const getDateRange = (
  startDate: Date,
  endDate: Date,
  dateField = 'createdAt',
) => {
  if (startDate && endDate) {
    return {
      [dateField]: And(MoreThan(startDate), LessThanOrEqual(endDate)),
    };
  }
  return {};
};
