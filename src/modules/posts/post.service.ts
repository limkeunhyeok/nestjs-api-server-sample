import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isBoolean } from 'class-validator';
import { pagingResponse } from 'src/libs/paging';
import { getDateRange } from 'src/libs/range';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { PostEntity } from './post.entity';
import { PostInfo, PostQuery } from './post.interface';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  @Transactional()
  async create(userId: number, postInfo: PostInfo) {
    const postEntity = this.generateEntity(userId, postInfo);
    return await this.postRepository.save(postEntity);
  }

  @Transactional()
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

    const range = getDateRange(startDate, endDate);
    const [postEntities, total] = await this.postRepository.findAndCount({
      where: {
        ...range,
        ...postInfo,
      },
      skip: offset,
      take: limit,
      order: { [sortingField]: sortingDirection },
    });

    return pagingResponse({ total, limit, offset, data: postEntities });
  }

  @Transactional()
  async getById(id: number) {
    const postEntity = await this.postRepository.findOneBy({ id });

    if (!postEntity) {
      throw new NotFoundException('Not found post entity.');
    }
    return postEntity;
  }

  @Transactional()
  async updateById(id: number, postInfo: Partial<PostEntity>) {
    const postEntity = await this.postRepository.findOneBy({ id });

    if (!postEntity) {
      throw new NotFoundException('Not found post entity.');
    }

    return await this.postRepository.save({ ...postEntity, ...postInfo });
  }

  @Transactional()
  async deleteById(id: number) {
    const postEntity = await this.postRepository.findOneBy({ id });

    if (!postEntity) {
      throw new NotFoundException('Not found post entity.');
    }

    await this.postRepository.remove(postEntity);

    return { ...postEntity, id };
  }

  private generateEntity(userId: number, postInfo: PostInfo) {
    const postEntity = new PostEntity();

    postEntity.title = postInfo.title;
    postEntity.contents = postInfo.contents;
    postEntity.published = postInfo.published;
    postEntity.authorId = userId;

    if (!isBoolean(postInfo.published)) {
      postEntity.published = true;
    }
    return postEntity;
  }
}
