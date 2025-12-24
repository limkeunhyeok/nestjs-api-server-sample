import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { TransformAndValidateBoolean } from 'src/common/decorators/boolean.decorator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  contents?: string;

  @IsOptional()
  @TransformAndValidateBoolean()
  @IsBoolean()
  published?: boolean;
}
