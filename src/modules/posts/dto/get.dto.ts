import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { CommonQueryDto } from 'src/common/dtos/common.dto';

export class GetPostsByQueryDto extends CommonQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  authorId?: number;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
