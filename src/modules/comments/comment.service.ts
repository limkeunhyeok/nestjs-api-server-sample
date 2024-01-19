import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isBoolean } from 'class-validator';
import { pagingResponse } from 'src/libs/paging';
import { getDateRange } from 'src/libs/range';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CommentEntity } from './comment.entity';
import { CommentInfo, CommentQuery } from './comment.interface';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  @Transactional()
  async create(userId: number, postId: number, commentInfo: CommentInfo) {
    const commentEntity = this.generateEntity(userId, postId, commentInfo);
    return await this.commentRepository.save(commentEntity);
  }

  @Transactional()
  async getByQuery(query: CommentQuery) {
    const {
      startDate,
      endDate,
      limit,
      offset,
      sortingField,
      sortingDirection,
      ...commentInfo
    } = query;

    const range = getDateRange(startDate, endDate);
    const [commentEntities, total] = await this.commentRepository.findAndCount({
      where: {
        ...range,
        ...commentInfo,
      },
      skip: offset,
      take: limit,
      order: { [sortingField]: sortingDirection },
    });

    return pagingResponse({ total, limit, offset, data: commentEntities });
  }

  @Transactional()
  async getById(id: number) {
    const commentEntity = await this.commentRepository.findOneBy({ id });

    if (!commentEntity) {
      throw new NotFoundException('Not found comment entity.');
    }
    return commentEntity;
  }

  @Transactional()
  async updateById(id: number, commentInfo: Partial<CommentEntity>) {
    const commentEntity = await this.commentRepository.findOneBy({ id });

    if (!commentEntity) {
      throw new NotFoundException('Not found comment entity.');
    }
    return await this.commentRepository.save({
      ...commentEntity,
      ...commentInfo,
    });
  }

  @Transactional()
  async deleteById(id: number) {
    const commentEntity = await this.commentRepository.findOneBy({ id });

    if (!commentEntity) {
      throw new NotFoundException('Not found comment entity.');
    }

    await this.commentRepository.remove(commentEntity);

    return { ...commentEntity, id };
  }

  private generateEntity(
    userId: number,
    postId: number,
    commentInfo: CommentInfo,
  ) {
    const commentEntity = new CommentEntity();

    commentEntity.contents = commentInfo.contents;
    commentEntity.published = commentInfo.published;
    commentEntity.authorId = userId;
    commentEntity.postId = postId;

    if (!isBoolean(commentInfo.published)) {
      commentEntity.published = true;
    }
    return commentEntity;
  }
}
