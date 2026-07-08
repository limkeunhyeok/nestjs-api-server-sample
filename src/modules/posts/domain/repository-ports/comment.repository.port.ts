import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { Comment } from '../entities/comment.model';

export interface CommentRepositoryPort {
  findOneById(id: number): Promise<Comment | null>;
  save(comment: Comment): Promise<Comment>;
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
  }): Promise<PaginationResponse<Comment>>;
  delete(id: number): Promise<void>;
}

export const COMMENT_REPOSITORY_PORT = Symbol('CommentRepositoryPort');
