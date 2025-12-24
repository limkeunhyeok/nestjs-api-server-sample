import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { TransformAndValidateBoolean } from 'src/common/decorators/boolean.decorator';
import { IsSortableField } from 'src/common/decorators/is-sortable-field.decorator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { CommentEntity } from '../entities/comment.entity';

const COMMENT_SORT_FIELDS: Partial<keyof CommentEntity>[] = [
  'id',
  'published',
  'createdAt',
  'updatedAt',
];

export class PaginateCommentsDto extends PaginateDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  authorId?: number;

  @IsOptional()
  @TransformAndValidateBoolean()
  @IsBoolean()
  published?: boolean;

  @IsSortableField(COMMENT_SORT_FIELDS)
  override sortField: string = 'createdAt';
}
