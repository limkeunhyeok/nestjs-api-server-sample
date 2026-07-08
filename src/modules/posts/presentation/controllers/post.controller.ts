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
import { Role } from 'src/common/constants/role.const';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserInToken } from 'src/common/decorators/user-in-token.decorator';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { AuthUser } from 'src/modules/auth/auth.interface';
import { CreatePostDto } from '../../application/dto/create-post.dto';
import { PaginatePostsDto } from '../../application/dto/paginate-posts.dto';
import { PostResponseDto } from '../../application/dto/post-response.dto';
import { UpdatePostDto } from '../../application/dto/update-post.dto';
import { PostService } from '../../application/services/post.service';

@ApiTags('posts')
@ApiBearerAuth('accessToken')
@UseInterceptors(ClassSerializerInterceptor)
@Roles([Role.ADMIN, Role.MEMBER])
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async create(
    @Body() body: CreatePostDto,
    @UserInToken('sub') userId: number,
  ): Promise<PostResponseDto> {
    const post = await this.postService.createPost({
      userId,
      ...body,
    });
    return PostResponseDto.fromDomain(post);
  }

  @Get()
  async paginate(
    @Query() query: PaginatePostsDto,
  ): Promise<PaginationResponse<PostResponseDto>> {
    const paginated = await this.postService.paginatePosts({
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
    return {
      ...paginated,
      data: paginated.data.map((p) => PostResponseDto.fromDomain(p)),
    };
  }

  @Get('/:postId')
  async getOneById(@Param('postId') postId: number): Promise<PostResponseDto> {
    const post = await this.postService.getPostById(postId);
    return PostResponseDto.fromDomain(post);
  }

  @Put('/:postId')
  async update(
    @Param('postId') postId: number,
    @Body() body: UpdatePostDto,
    @UserInToken() payload: AuthUser,
  ): Promise<PostResponseDto> {
    const post = await this.postService.updatePost(postId, body, payload);
    return PostResponseDto.fromDomain(post);
  }

  @Delete('/:postId')
  async delete(
    @Param('postId') postId: number,
    @UserInToken() payload: AuthUser,
  ): Promise<PostResponseDto> {
    const post = await this.postService.deletePost(postId, payload);
    return PostResponseDto.fromDomain(post);
  }
}
