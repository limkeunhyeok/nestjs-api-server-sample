import { FindOptionsOrderValue, FindOptionsWhere } from 'typeorm';
import { CommentEntity } from './comment.entity';

export interface CommentInfo {
  contents: string;
  published: boolean;
}

export interface CommentQuery
  extends Pick<
    FindOptionsWhere<CommentEntity>,
    'authorId' | 'postId' | 'published'
  > {
  startDate?: Date;
  endDate?: Date;
  limit: number;
  offset: number;
  sortField: string;
  sortDirection: FindOptionsOrderValue;
}
