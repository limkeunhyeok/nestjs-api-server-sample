import { FindOptionsOrderValue, FindOptionsWhere } from 'typeorm';
import { PostEntity } from './post.entity';

export interface PostInfo {
  title: string;
  contents: string;
  published?: boolean;
}

export interface PostQuery
  extends Pick<FindOptionsWhere<PostEntity>, 'authorId' | 'published'> {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  sortingField?: string;
  sortingDirection?: FindOptionsOrderValue;
}
