import { Inject, Injectable } from '@nestjs/common';
import {
  buildCommentByIdCacheKey,
  buildCommentsPaginationCacheKey,
} from 'src/common/cache/comment.cache-key';
import {
  FORBIDDEN_RESOURCE_MODIFICATION,
  NOT_FOUND_RESOURCE,
  RESOURCE_NOT_ASSOCIATED,
} from 'src/common/constants/exception-message.const';
import { Role } from 'src/common/constants/role.const';
import { CacheEvict } from 'src/common/decorators/cache-evict.decorator';
import { Cacheable } from 'src/common/decorators/cacheable.decorator';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { removeUndefined } from 'src/libs/object';
import { Transactional } from 'typeorm-transactional';
import { UserService } from '../../../users/application/services/user.service';
import { Comment } from '../../domain/entities/comment.model';
import {
  CommentConflictException,
  CommentForbiddenException,
  CommentNotFoundException,
} from '../../domain/exceptions/comment.exception';
import {
  COMMENT_REPOSITORY_PORT,
  CommentRepositoryPort,
} from '../../domain/repository-ports/comment.repository.port';
import { getTTL } from '../../utils/comment.util';
import { PostService } from './post.service';

@Injectable()
export class CommentService {
  constructor(
    @Inject(COMMENT_REPOSITORY_PORT)
    private readonly commentRepository: CommentRepositoryPort,
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  @CacheEvict({ keysSetName: 'cacheKeys' })
  @Transactional()
  async createComment(params: {
    userId: number;
    postId: number;
    contents: string;
    published: boolean;
  }): Promise<Comment> {
    const user = await this.userService.getUserById(params.userId);
    const post = await this.postService.getPostById(params.postId);

    const comment = new Comment(
      0,
      params.contents,
      params.published,
      user.id,
      user,
      post,
    );

    return await this.commentRepository.save(comment);
  }

  @Cacheable({
    keyGenerator: (params) => buildCommentsPaginationCacheKey(params),
    ttl: (params) => getTTL(params),
  })
  @Transactional()
  async paginateComments(params: {
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
    return await this.commentRepository.paginate(params);
  }

  @Cacheable<[number, number]>({
    keyGenerator: (postId: number, commentId: number) =>
      buildCommentByIdCacheKey(commentId),
    ttl: 3600000,
    trackKeys: true,
    keysSetName: 'cacheKeys',
  })
  @Transactional()
  async getCommentById(postId: number, commentId: number): Promise<Comment> {
    const post = await this.postService.getPostById(postId);

    const comment = await this.commentRepository.findOneById(commentId);

    if (!comment) {
      throw new CommentNotFoundException(NOT_FOUND_RESOURCE);
    }

    if (!comment.post || post.id !== comment.post.id) {
      throw new CommentConflictException(RESOURCE_NOT_ASSOCIATED);
    }

    return comment;
  }

  @CacheEvict({ keysSetName: 'cacheKeys' })
  @Transactional()
  async updateComment(
    postId: number,
    commentId: number,
    params: {
      contents?: string;
      published?: boolean;
    },
    userInToken: {
      sub: number;
      role: Role;
    },
  ): Promise<Comment> {
    const post = await this.postService.getPostById(postId);
    const comment = await this.commentRepository.findOneById(commentId);

    if (!comment) {
      throw new CommentNotFoundException(NOT_FOUND_RESOURCE);
    }

    if (!comment.post || post.id !== comment.post.id) {
      throw new CommentConflictException(RESOURCE_NOT_ASSOCIATED);
    }

    if (
      userInToken.role !== Role.ADMIN &&
      userInToken.sub !== comment.authorId
    ) {
      throw new CommentForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    const updateFields = removeUndefined(params);

    comment.update(updateFields);

    return await this.commentRepository.save(comment);
  }

  @CacheEvict({ keysSetName: 'cacheKeys' })
  @Transactional()
  async deleteComment(
    postId: number,
    commentId: number,
    userInToken: {
      sub: number;
      role: Role;
    },
  ): Promise<Comment> {
    const post = await this.postService.getPostById(postId);
    const comment = await this.commentRepository.findOneById(commentId);

    if (!comment) {
      throw new CommentNotFoundException(NOT_FOUND_RESOURCE);
    }

    if (!comment.post || post.id !== comment.post.id) {
      throw new CommentConflictException(RESOURCE_NOT_ASSOCIATED);
    }

    if (
      userInToken.role !== Role.ADMIN &&
      userInToken.sub !== comment.authorId
    ) {
      throw new CommentForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    await this.commentRepository.delete(comment.id);

    return comment;
  }
}
