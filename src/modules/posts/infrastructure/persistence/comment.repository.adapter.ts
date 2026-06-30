import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CommentRepositoryPort } from '../../domain/repository-ports/comment.repository.port';
import { CommentEntity } from './comment.orm-entity';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { getDateRange } from 'src/libs/range';
import { toPaginationResponse } from 'src/libs/pagination';

@Injectable()
export class CommentRepositoryAdapter implements CommentRepositoryPort {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repo: Repository<CommentEntity>,
  ) {}

  async findOneById(id: number): Promise<CommentEntity | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ['author', 'post'],
    });
  }

  async save(comment: Partial<CommentEntity>): Promise<CommentEntity> {
    return await this.repo.save(comment);
  }

  async paginate(params: {
    authorId?: number;
    postId?: number;
    published?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PaginationResponse<CommentEntity>> {
    const {
      authorId,
      postId,
      published,
      startDate,
      endDate,
      limit,
      offset,
      sortField,
      sortDirection,
    } = params;

    const query: FindOptionsWhere<CommentEntity> = {};
    const range = getDateRange(startDate, endDate);

    if (authorId) {
      query.author = { id: authorId };
    }

    if (postId) {
      query.post = { id: postId };
    }

    if (published !== undefined) {
      query.published = published;
    }

    const [comments, total] = await this.repo.findAndCount({
      where: {
        ...query,
        ...range,
      },
      order: {
        [sortField]: sortDirection,
      },
      skip: limit > 0 ? offset : undefined,
      take: limit > 0 ? limit : undefined,
      relations: ['author', 'post'],
    });

    return toPaginationResponse({ total, limit, offset, data: comments });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
