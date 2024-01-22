import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Length(1, 100)
  title: string;

  @IsString()
  contents: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class CreateCommentDto {
  @IsString()
  contents: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
