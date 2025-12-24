import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { TransformAndValidateBoolean } from 'src/common/decorators/boolean.decorator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  title?: string;

  @IsOptional()
  @IsString()
  contents?: string;

  @IsOptional()
  @TransformAndValidateBoolean()
  @IsBoolean()
  published?: boolean;
}
