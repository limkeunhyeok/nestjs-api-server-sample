import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { IsBeforeDate } from '../decorators/is-date.decorator';

export const SortDirection = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];

export class PaginateDto {
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @IsBeforeDate('endDate')
  startDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  limit: number = 10000;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset: number = 0;

  @IsString()
  @IsOptional()
  sortField: string = 'createdAt';

  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.DESC;
}
