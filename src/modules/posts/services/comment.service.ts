import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { toPaginationResponse } from 'src/libs/pagination';
import { getDateRange } from 'src/libs/range';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { UserService } from '../../users/user.service';
import { CommentEntity } from '../entities/comment.entity';
import { getTTL } from '../utils/comment.util';
import { PostService } from './post.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
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
  }): Promise<CommentEntity> {
    const user = await this.userService.getUserById(params.userId);
    const post = await this.postService.getPostById(params.postId);

    const createdComment = this.commentRepository.create({
      contents: params.contents,
      published: params.published,
      author: user,
      post,
    });

    return await this.commentRepository.save(createdComment);
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
      query.author = {
        id: authorId,
      };
    }

    if (postId) {
      query.post = {
        id: postId,
      };
    }

    if (published) {
      query.published = published;
    }

    const [commentEntities, total] = await this.commentRepository.findAndCount({
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

    return toPaginationResponse({
      total,
      limit,
      offset,
      data: commentEntities,
    });
  }

  @Cacheable<[number, number]>({
    keyGenerator: (postId: number, commentId: number) =>
      buildCommentByIdCacheKey(commentId),
    ttl: 3600000, // 1시간
    trackKeys: true,
    keysSetName: 'cacheKeys',
  })
  @Transactional()
  async getCommentById(
    postId: number,
    commentId: number,
  ): Promise<CommentEntity> {
    const post = await this.postService.getPostById(postId);

    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
      relations: ['author', 'post'],
    });

    if (!comment) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    if (post.id !== comment.post.id) {
      throw new ConflictException(RESOURCE_NOT_ASSOCIATED);
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
  ): Promise<CommentEntity> {
    const comment = await this.getCommentById(postId, commentId);

    if (
      userInToken.role !== Role.ADMIN &&
      userInToken.sub !== comment.author.id
    ) {
      throw new ForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    const updateFields = removeUndefined(params);

    Object.assign(comment, updateFields);

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
  ): Promise<CommentEntity> {
    const comment = await this.getCommentById(postId, commentId);

    if (
      userInToken.role !== Role.ADMIN &&
      userInToken.sub !== comment.author.id
    ) {
      throw new ForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    const deletedComment = { ...comment };

    await this.commentRepository.remove(comment); // remove 시, id에 undefined가 할당

    return deletedComment;
  }
}
