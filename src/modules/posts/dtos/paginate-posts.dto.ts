import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { TransformAndValidateBoolean } from 'src/common/decorators/boolean.decorator';
import { IsSortableField } from 'src/common/decorators/is-sortable-field.decorator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { PostEntity } from '../entities/post.entity';

const POST_SORT_FIELDS: Partial<keyof PostEntity>[] = [
  'id',
  'published',
  'createdAt',
  'updatedAt',
];

export class PaginatePostsDto extends PaginateDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  authorId?: number;

  @IsOptional()
  @TransformAndValidateBoolean()
  @IsBoolean()
  published?: boolean;

  @IsSortableField(POST_SORT_FIELDS)
  override sortField: string = 'createdAt';
}
