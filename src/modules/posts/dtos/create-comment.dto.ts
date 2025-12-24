import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  contents: string;

  @IsOptional()
  @IsBoolean()
  published: boolean = true;
}
