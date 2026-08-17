import { Inject, Injectable } from '@nestjs/common';
import {
  PostForbiddenException,
  PostNotFoundException,
} from '../../domain/exceptions/post.exception';
import {
  buildPostByIdCacheKey,
  buildPostsPaginationCacheKey,
} from 'src/common/cache/post.cache-key';
import {
  FORBIDDEN_RESOURCE_MODIFICATION,
  NOT_FOUND_RESOURCE,
} from 'src/common/constants/exception-message.const';
import { CacheEvict } from 'src/common/decorators/cache-evict.decorator';
import { Cacheable } from 'src/common/decorators/cacheable.decorator';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { removeUndefined } from 'src/libs/object';
import { Transactional } from 'typeorm-transactional';
import { Role } from 'src/common/constants/role.const';
import { UserService } from '../../../users/application/services/user.service';
import { Post } from '../../domain/entities/post.model';
import { getTTL } from '../../utils/post.util';
import {
  POST_REPOSITORY_PORT,
  PostRepositoryPort,
} from '../../domain/repository-ports/post.repository.port';

@Injectable()
export class PostService {
  constructor(
    @Inject(POST_REPOSITORY_PORT)
    private readonly postRepository: PostRepositoryPort,
    private readonly userService: UserService,
  ) {}

  @CacheEvict({ keysSetName: 'cacheKeys' })
  @Transactional()
  async createPost(params: {
    userId: number;
    title: string;
    contents: string;
    published: boolean;
  }): Promise<Post> {
    const user = await this.userService.getUserById(params.userId);

    const post = new Post(
      0,
      params.title,
      params.contents,
      params.published,
      user.id,
      user,
    );

    return await this.postRepository.save(post);
  }

  @Cacheable({
    keyGenerator: (params) => buildPostsPaginationCacheKey(params),
    ttl: (params) => getTTL(params),
    transform: (cached: unknown): PaginationResponse<Post> => {
      const c = cached as PaginationResponse<unknown>;
      return {
        ...c,
        data: c.data
          .map((item) => Post.reconstitute(item))
          .filter((p): p is Post => p instanceof Post),
      };
    },
  })
  @Transactional()
  async paginatePosts(params: {
    authorId?: number;
    published?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PaginationResponse<Post>> {
    return await this.postRepository.paginate(params);
  }

  @Cacheable<[number]>({
    keyGenerator: (postId: number) => buildPostByIdCacheKey(postId),
    ttl: 3600000,
    trackKeys: true,
    keysSetName: 'cacheKeys',
    transform: (cached: unknown): Post => Post.reconstitute(cached) as Post,
  })
  @Transactional()
  async getPostById(postId: number): Promise<Post> {
    const post = await this.postRepository.findOneById(postId);

    if (!post) {
      throw new PostNotFoundException(NOT_FOUND_RESOURCE);
    }

    return post;
  }

  @CacheEvict({ keysSetName: 'cacheKeys' })
  @Transactional()
  async updatePost(
    postId: number,
    params: {
      title?: string;
      contents?: string;
      published?: boolean;
    },
    userInToken: {
      sub: number;
      role: Role;
    },
  ): Promise<Post> {
    const post = await this.postRepository.findOneById(postId);

    if (!post) {
      throw new PostNotFoundException(NOT_FOUND_RESOURCE);
    }

    if (userInToken.role !== Role.ADMIN && userInToken.sub !== post.authorId) {
      throw new PostForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    const updateFields = removeUndefined(params);

    post.update(updateFields);

    return await this.postRepository.save(post);
  }

  @CacheEvict({ keysSetName: 'cacheKeys' })
  @Transactional()
  async deletePost(
    postId: number,
    userInToken: {
      sub: number;
      role: Role;
    },
  ): Promise<Post> {
    const post = await this.postRepository.findOneById(postId);

    if (!post) {
      throw new PostNotFoundException(NOT_FOUND_RESOURCE);
    }

    if (userInToken.role !== Role.ADMIN && userInToken.sub !== post.authorId) {
      throw new PostForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    await this.postRepository.delete(post.id);

    return post;
  }
}
