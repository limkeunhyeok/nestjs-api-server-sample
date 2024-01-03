import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsBeforeDate } from '../decorators/date.decorator';

enum SortingDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class CommonQueryDto {
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
  @IsNumber()
  @IsOptional()
  limit?: number = 10000;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  offset?: number = 0;

  @IsString()
  @IsOptional()
  sortingField?: string = 'createdAt';

  @IsEnum(SortingDirection)
  @IsOptional()
  sortingDirection?: SortingDirection = SortingDirection.DESC;
}
