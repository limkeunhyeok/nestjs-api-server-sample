import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  contents?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
