import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserInToken } from 'src/common/decorators/user-in-token.decorator';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { AuthUser } from 'src/modules/auth/auth.interface';
import { Role } from '../../../common/constants/role.const';
import { CreatePostDto } from '../dtos/create-post.dto';
import { PaginatePostsDto } from '../dtos/paginate-posts.dto';
import { UpdatePostDto } from '../dtos/update-post.dto';
import { PostEntity } from '../entities/post.entity';
import { PostService } from '../services/post.service';

@ApiTags('posts')
@ApiBearerAuth('accessToken')
@UseInterceptors(ClassSerializerInterceptor) // author password
@Roles([Role.ADMIN, Role.MEMBER])
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @Post()
  async create(
    @Body() body: CreatePostDto,
    @UserInToken('sub') userId: number,
  ): Promise<PostEntity> {
    return await this.postService.createPost({
      userId,
      ...body,
    });
  }

  @Get()
  async paginate(
    @Query() query: PaginatePostsDto,
  ): Promise<PaginationResponse<PostEntity>> {
    return await this.postService.paginatePosts({
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
  }

  @Get('/:postId')
  async getOneById(@Param('postId') postId: number): Promise<PostEntity> {
    return await this.postService.getPostById(postId);
  }

  @Put('/:postId')
  @Put('/:postId')
  async update(
    @Param('postId') postId: number,
    @Body() body: UpdatePostDto,
    @UserInToken() payload: AuthUser,
  ): Promise<PostEntity> {
    return await this.postService.updatePost(postId, body, payload);
  }

  @Delete('/:postId')
  async delete(
    @Param('postId') postId: number,
    @UserInToken() payload: AuthUser,
  ): Promise<PostEntity> {
    return await this.postService.deletePost(postId, payload);
  }
}
