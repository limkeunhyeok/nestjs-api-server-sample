import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isBoolean } from 'class-validator';
import { pagingResponse } from 'src/libs/paging';
import { getDateRange } from 'src/libs/range';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CommentEntity } from '../comments/comment.entity';
import { CommentInfo, CommentQuery } from '../comments/comment.interface';
import { CommentService } from '../comments/comment.service';
import { Role } from '../users/user.entity';
import { PostEntity } from './post.entity';
import { PostInfo, PostQuery } from './post.interface';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly commentService: CommentService,
  ) {}

  @Transactional()
  async createPost(userId: number, postInfo: PostInfo) {
    const postEntity = this.generateEntity(userId, postInfo);
    return await this.postRepository.save(postEntity);
  }

  @Transactional()
  async getPostsByQuery(query: PostQuery) {
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
  async getPostById(postId: number) {
    const postEntity = await this.postRepository.findOneBy({ id: postId });

    if (!postEntity) {
      throw new NotFoundException('Not found post entity.');
    }
    return postEntity;
  }

  @Transactional()
  async updatePostById(
    userId: number,
    postId: number,
    postInfo: Partial<PostEntity>,
  ) {
    const postEntity = await this.postRepository.findOneBy({ id: postId });

    if (!postEntity) {
      throw new NotFoundException('Not found post entity.');
    }

    if (postEntity.authorId !== userId) {
      throw new ForbiddenException('Access is denied.');
    }

    return await this.postRepository.save({ ...postEntity, ...postInfo });
  }

  @Transactional()
  async deletePostById(userId: number, role: Role, postId: number) {
    const postEntity = await this.postRepository.findOneBy({ id: postId });

    if (!postEntity) {
      throw new NotFoundException('Not found post entity.');
    }

    if (postEntity.authorId !== userId || role !== Role.ADMIN) {
      throw new ForbiddenException('Access is denied.');
    }

    await this.postRepository.remove(postEntity);

    return { ...postEntity, id: postId };
  }

  @Transactional()
  async createComment(
    userId: number,
    postId: number,
    commentInfo: CommentInfo,
  ) {
    const post = await this.getPostById(postId);

    return await this.commentService.create(userId, post.id, commentInfo);
  }

  @Transactional()
  async getCommentsByQuery(
    postId: number,
    query: Omit<CommentQuery, 'postId'>,
  ) {
    const post = await this.getPostById(postId);

    return await this.commentService.getByQuery({ ...query, postId: post.id });
  }

  @Transactional()
  async getCommentById(postId: number, commentId: number) {
    const post = await this.getPostById(postId);

    const comment = await this.commentService.getById(commentId);
    if (comment.postId !== post.id) {
      throw new ConflictException(
        'The postId provided does not match the postId of the associated comment.',
      );
    }

    return comment;
  }

  @Transactional()
  async updateCommentById(
    userId: number,
    postId: number,
    commentId: number,
    commentInfo: Partial<CommentEntity>,
  ) {
    const post = await this.getPostById(postId);

    const comment = await this.commentService.getById(commentId);
    if (comment.postId !== post.id) {
      throw new ConflictException(
        'The postId provided does not match the postId of the associated comment.',
      );
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('Access is denied.');
    }

    return await this.commentService.updateById(commentId, commentInfo);
  }

  @Transactional()
  async deleteCommentById(
    userId: number,
    role: Role,
    postId: number,
    commentId: number,
  ) {
    const post = await this.getPostById(postId);

    const comment = await this.commentService.getById(commentId);
    if (comment.postId !== post.id) {
      throw new ConflictException(
        'The postId provided does not match the postId of the associated comment.',
      );
    }

    if (comment.authorId !== userId || role !== Role.ADMIN) {
      throw new ForbiddenException('Access is denied.');
    }

    return await this.commentService.deleteById(commentId);
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
