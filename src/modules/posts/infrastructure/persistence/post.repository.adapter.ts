import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { toPaginationResponse } from 'src/libs/pagination';
import { getDateRange } from 'src/libs/range';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Post } from '../../domain/entities/post.model';
import { PostRepositoryPort } from '../../domain/repository-ports/post.repository.port';
import { PostOrmEntity } from './entities/post.orm-entity';
import { PostMapper } from './mappers/post.mapper';

@Injectable()
export class PostRepositoryAdapter implements PostRepositoryPort {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly repo: Repository<PostOrmEntity>,
  ) {}

  async findOneById(id: number): Promise<Post | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: ['author'],
    });
    return orm ? PostMapper.toDomain(orm) : null;
  }

  async save(post: Post): Promise<Post> {
    const ormEntity = PostMapper.toOrm(post);
    const saved = await this.repo.save(ormEntity);
    return (await this.findOneById(saved.id))!;
  }

  async paginate(params: {
    authorId?: number;
    published?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PaginationResponse<Post>> {
    const {
      authorId,
      published,
      startDate,
      endDate,
      limit,
      offset,
      sortField,
      sortDirection,
    } = params;

    const query: FindOptionsWhere<PostOrmEntity> = {};
    const range = getDateRange(startDate, endDate);

    if (authorId) {
      query.author = { id: authorId };
    }

    if (published !== undefined) {
      query.published = published;
    }

    const [posts, total] = await this.repo.findAndCount({
      where: {
        ...query,
        ...range,
      },
      order: {
        [sortField]: sortDirection,
      },
      skip: limit > 0 ? offset : undefined,
      take: limit > 0 ? limit : undefined,
      relations: ['author'],
    });

    const domainPosts = posts.map((p) => PostMapper.toDomain(p));

    return toPaginationResponse({ total, limit, offset, data: domainPosts });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
