import { IsBoolean, IsString, Length } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Length(1, 100)
  title: string;

  @IsString()
  contents: string;

  @IsBoolean()
  published: boolean;
}
