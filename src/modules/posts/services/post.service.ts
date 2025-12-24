import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FORBIDDEN_RESOURCE_MODIFICATION,
  NOT_FOUND_RESOURCE,
} from 'src/common/constants/exception-message.const';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { removeUndefined } from 'src/libs/object';
import { PagingResponse, pagingResponse } from 'src/libs/paging';
import { getDateRange } from 'src/libs/range';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Role } from '../../../common/constants/role.const';
import { UserService } from '../../users/user.service';
import { PostEntity } from '../entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly userService: UserService,
  ) {}

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
  }): Promise<PagingResponse<PostEntity>> {
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

    return pagingResponse({ total, limit, offset, data: postEntities });
  }

  @Transactional()
  async getPostById(postId: number): Promise<PostEntity> {
    const postEntity = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author'],
    });

    if (!postEntity) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return postEntity;
  }

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
      throw new ForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    const updateFields = removeUndefined(params);

    Object.assign(post, updateFields);

    return await this.postRepository.save(post);
  }

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
      throw new ForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    const deletedPost = { ...post };

    await this.postRepository.remove(post); // remove 시, id에 undefined가 할당

    return deletedPost;
  }
}
