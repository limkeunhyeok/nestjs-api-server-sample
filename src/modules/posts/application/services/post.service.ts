import { Injectable } from '@nestjs/common';
import {
  PostForbiddenException,
  PostNotFoundException,
} from '../../domain/exceptions/post.exception';
import { InjectRepository } from '@nestjs/typeorm';
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
import { toPaginationResponse } from 'src/libs/pagination';
import { getDateRange } from 'src/libs/range';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Role } from 'src/common/constants/role.const';
import { UserService } from '../../../users/application/user.service';
import { PostEntity } from '../../infrastructure/persistence/post.orm-entity';
import { getTTL } from '../../utils/post.util';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly userService: UserService,
  ) {}

  @CacheEvict({ keysSetName: 'cacheKeys' })
  @Transactional()
  async createPost(params: {
    userId: number;
    title: string;
    contents: string;
    published: boolean;
  }): Promise<PostEntity> {
    const user = await this.userService.getUserById(params.userId);

    const createdPost = this.postRepository.create({
      title: params.title,
      contents: params.contents,
      published: params.published,
      author: user,
    });

    return await this.postRepository.save(createdPost);
  }

  @Cacheable({
    keyGenerator: (params) => buildPostsPaginationCacheKey(params),
    ttl: (params) => getTTL(params),
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
      query.author = {
        id: authorId,
      };
    }

    if (published) {
      query.published = published;
    }

    const [postEntities, total] = await this.postRepository.findAndCount({
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

    return toPaginationResponse({ total, limit, offset, data: postEntities });
  }

  @Cacheable<[number]>({
    keyGenerator: (postId: number) => buildPostByIdCacheKey(postId),
    ttl: 3600000, // 1시간
    trackKeys: true,
    keysSetName: 'cacheKeys',
  })
  @Transactional()
  async getPostById(postId: number): Promise<PostEntity> {
    const postEntity = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author'],
    });

    if (!postEntity) {
      throw new PostNotFoundException(NOT_FOUND_RESOURCE);
    }

    return postEntity;
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
  ): Promise<PostEntity> {
    const post = await this.getPostById(postId);

    if (userInToken.role !== Role.ADMIN && userInToken.sub !== post.author.id) {
      throw new PostForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    const updateFields = removeUndefined(params);

    Object.assign(post, updateFields);

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
  ): Promise<PostEntity> {
    const post = await this.getPostById(postId);

    if (userInToken.role !== Role.ADMIN && userInToken.sub !== post.author.id) {
      throw new PostForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    const deletedPost = { ...post };

    await this.postRepository.remove(post); // remove 시, id에 undefined가 할당

    return deletedPost;
  }
}
