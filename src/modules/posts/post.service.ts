import { Injectable, NotFoundException } from '@nestjs/common';
import { pagingResponse } from 'src/libs/paging';
import { getDateRange } from 'src/libs/range';
import { DataSource } from 'typeorm';
import { PostEntity } from './post.entity';
import { PostInfo, PostQuery } from './post.interface';

@Injectable()
export class PostService {
  constructor(private readonly datasource: DataSource) {}

  async create(userId: number, postInfo: PostInfo) {
    return await this.datasource.manager.transaction(async (manager) => {
      const postEntity = this.generateEntity(userId, postInfo);
      return await manager.save(PostEntity, postEntity);
    });
  }

  async getByQuery(query: PostQuery) {
    const {
      startDate,
      endDate,
      limit,
      offset,
      sortingField,
      sortingDirection,
      ...postInfo
    } = query;

    const [posts, total] = await this.datasource.manager.transaction(
      async (manager) => {
        const range = getDateRange(startDate, endDate);

        const [postEntities, total] = await manager.findAndCount(PostEntity, {
          where: {
            ...range,
            ...postInfo,
          },
          skip: offset,
          take: limit,
          order: { [sortingField]: sortingDirection },
        });

        return [postEntities, total];
      },
    );
    return pagingResponse({ total, limit, offset, data: posts });
  }

  async getById(id: number) {
    const postEntity = await this.datasource.manager.transaction(
      async (manager) => {
        return manager.findOneBy(PostEntity, { id });
      },
    );

    if (!postEntity) {
      throw new NotFoundException('Not found post entity.');
    }
    return postEntity;
  }

  async updateById(id: number, postInfo: Partial<PostEntity>) {
    const postEntity = await this.datasource.manager.transaction(
      async (manager) => {
        const postEntity = await manager.findOneBy(PostEntity, { id });

        if (!postEntity) {
          throw new NotFoundException('Not found post entity.');
        }

        return await manager.save(PostEntity, { ...postEntity, ...postInfo });
      },
    );

    return postEntity;
  }

  async deleteById(id: number) {
    const postEntity = await this.datasource.manager.transaction(
      async (manager) => {
        const postEntity = await manager.findOneBy(PostEntity, { id });

        if (!postEntity) {
          throw new NotFoundException('Not found post entity.');
        }

        return await manager.remove(PostEntity, postEntity);
      },
    );

    return postEntity;
  }

  private generateEntity(userId: number, postInfo: PostInfo) {
    const postEntity = new PostEntity();

    postEntity.title = postInfo.title;
    postEntity.contents = postInfo.contents;
    postEntity.authorId = userId;

    if (postInfo.published === true || postInfo.published === false) {
      postEntity.published = postInfo.published;
    }
    return postEntity;
  }
}
