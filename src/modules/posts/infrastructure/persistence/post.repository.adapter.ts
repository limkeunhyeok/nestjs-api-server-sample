import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PostRepositoryPort } from '../../domain/repository-ports/post.repository.port';
import { PostEntity } from './post.orm-entity';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { getDateRange } from 'src/libs/range';
import { toPaginationResponse } from 'src/libs/pagination';

@Injectable()
export class PostRepositoryAdapter implements PostRepositoryPort {
  constructor(
    @InjectRepository(PostEntity)
    private readonly repo: Repository<PostEntity>,
  ) {}

  async findOneById(id: number): Promise<PostEntity | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async save(post: Partial<PostEntity>): Promise<PostEntity> {
    const saved = await this.repo.save(post);
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
  }): Promise<PaginationResponse<PostEntity>> {
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

    const query: FindOptionsWhere<PostEntity> = {};
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

    return toPaginationResponse({ total, limit, offset, data: posts });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
