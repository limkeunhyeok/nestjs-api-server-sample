import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { PostEntity } from '../../infrastructure/persistence/post.orm-entity';

export interface PostRepositoryPort {
  findOneById(id: number): Promise<PostEntity | null>;
  save(post: Partial<PostEntity>): Promise<PostEntity>;
  paginate(params: {
    authorId?: number;
    published?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PaginationResponse<PostEntity>>;
  delete(id: number): Promise<void>;
}

export const POST_REPOSITORY_PORT = Symbol('PostRepositoryPort');
