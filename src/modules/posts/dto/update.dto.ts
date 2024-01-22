import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdatePostByIdDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  title?: string;

  @IsOptional()
  @IsString()
  contents?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateCommentByIdDto {
  @IsOptional()
  @IsString()
  contents?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
