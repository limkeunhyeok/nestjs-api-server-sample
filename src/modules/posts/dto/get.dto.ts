import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { CommonQueryDto } from 'src/common/dtos/common.dto';

export class GetPostsByQueryDto extends CommonQueryDto {
  @IsOptional()
  @IsNumber()
  authorId?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
