import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { Post } from '../entities/post.model';

export interface PostRepositoryPort {
  findOneById(id: number): Promise<Post | null>;
  save(post: Post): Promise<Post>;
  paginate(params: {
    authorId?: number;
    published?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PaginationResponse<Post>>;
  delete(id: number): Promise<void>;
}

export const POST_REPOSITORY_PORT = Symbol('PostRepositoryPort');
