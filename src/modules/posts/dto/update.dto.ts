import { IsBoolean, IsOptional, IsString, Max } from 'class-validator';

export class UpdatePostByIdDto {
  @IsOptional()
  @IsString()
  @Max(100)
  title?: string;

  @IsOptional()
  @IsString()
  contents?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
