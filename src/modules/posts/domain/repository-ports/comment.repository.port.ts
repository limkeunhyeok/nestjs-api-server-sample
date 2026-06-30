import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { CommentEntity } from '../../infrastructure/persistence/comment.orm-entity';

export interface CommentRepositoryPort {
  findOneById(id: number): Promise<CommentEntity | null>;
  save(comment: Partial<CommentEntity>): Promise<CommentEntity>;
  paginate(params: {
    authorId?: number;
    postId?: number;
    published?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PaginationResponse<CommentEntity>>;
  delete(id: number): Promise<void>;
}

export const COMMENT_REPOSITORY_PORT = Symbol('CommentRepositoryPort');
