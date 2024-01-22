import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { TransformAndValidateBoolean } from 'src/common/decorators/boolean.decorator';
import { CommonQueryDto } from 'src/common/dtos/common.dto';

export class GetPostsByQueryDto extends CommonQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  authorId?: number;

  @IsOptional()
  @TransformAndValidateBoolean()
  @IsBoolean()
  published?: boolean;
}

export class GetCommentsByQueryDto extends CommonQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  authorId?: number;

  @IsOptional()
  @TransformAndValidateBoolean()
  @IsBoolean()
  published?: boolean;
}
