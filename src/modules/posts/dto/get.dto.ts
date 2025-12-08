import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { TransformAndValidateBoolean } from 'src/common/decorators/boolean.decorator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class GetPostsByQueryDto extends PaginateDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  authorId?: number;

  @IsOptional()
  @TransformAndValidateBoolean()
  @IsBoolean()
  published?: boolean;
}

export class GetCommentsByQueryDto extends PaginateDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  authorId?: number;

  @IsOptional()
  @TransformAndValidateBoolean()
  @IsBoolean()
  published?: boolean;
}
