import { IsBoolean, IsString, Max } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Max(100)
  title: string;

  @IsString()
  contents: string;

  @IsBoolean()
  published: boolean;
}
