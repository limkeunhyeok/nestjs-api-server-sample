import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { toPaginationResponse } from 'src/libs/pagination';
import { getDateRange } from 'src/libs/range';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Comment } from '../../domain/entities/comment.model';
import { CommentRepositoryPort } from '../../domain/repository-ports/comment.repository.port';
import { CommentOrmEntity } from './entities/comment.orm-entity';
import { CommentMapper } from './mappers/comment.mapper';

@Injectable()
export class CommentRepositoryAdapter implements CommentRepositoryPort {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly repo: Repository<CommentOrmEntity>,
  ) {}

  async findOneById(id: number): Promise<Comment | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: ['author', 'post'],
    });
    return orm ? CommentMapper.toDomain(orm) : null;
  }

  async save(comment: Comment): Promise<Comment> {
    const ormEntity = CommentMapper.toOrm(comment);
    const saved = await this.repo.save(ormEntity);
    return (await this.findOneById(saved.id))!;
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
  }): Promise<PaginationResponse<Comment>> {
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

    const query: FindOptionsWhere<CommentOrmEntity> = {};
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

    const domainComments = comments.map((c) => CommentMapper.toDomain(c));

    return toPaginationResponse({ total, limit, offset, data: domainComments });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
