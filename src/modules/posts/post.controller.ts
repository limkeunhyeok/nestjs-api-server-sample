import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserInToken } from 'src/common/decorators/user.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from '../users/user.entity';
import { CreateCommentDto, CreatePostDto } from './dto/create.dto';
import { GetCommentsByQueryDto, GetPostsByQueryDto } from './dto/get.dto';
import { UpdateCommentByIdDto, UpdatePostByIdDto } from './dto/update.dto';
import { PostService } from './post.service';

@ApiTags('posts')
@ApiBearerAuth('accessToken')
@UseGuards(RoleGuard([Role.ADMIN, Role.MEMBER]))
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async createPost(
    @Body() dto: CreatePostDto,
    @UserInToken('userId') userId: number,
  ) {
    return await this.postService.createPost(userId, dto);
  }

  @Get()
  async getPostsByQuery(@Query() query: GetPostsByQueryDto) {
    return await this.postService.getPostsByQuery(query);
  }

  @Get('/:postId')
  async getPostById(@Param('postId') postId: number) {
    return await this.postService.getPostById(postId);
  }

  @Put('/:postId')
  async updatePostById(
    @UserInToken('userId') userId: number,
    @Param('postId') postId: number,
    @Body() dto: UpdatePostByIdDto,
  ) {
    return await this.postService.updatePostById(userId, postId, dto);
  }

  @Delete('/:postId')
  async deletePostById(
    @UserInToken('userId') userId: number,
    @UserInToken('role') role: Role,
    @Param('postId') postId: number,
  ) {
    return await this.postService.deletePostById(userId, role, postId);
  }

  @Post('/:postId/comments')
  async createComment(
    @UserInToken('userId') userId: number,
    @Param('postId') postId: number,
    @Body() dto: CreateCommentDto,
  ) {
    return await this.postService.createComment(userId, postId, dto);
  }

  @Get('/:postId/comments')
  async getCommentsByQuery(
    @Param('postId') postId: number,
    @Query() query: GetCommentsByQueryDto,
  ) {
    return await this.postService.getCommentsByQuery(postId, query);
  }

  @Get('/:postId/comments/:commentId')
  async getCommentById(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
  ) {
    return await this.postService.getCommentById(postId, commentId);
  }

  @Put('/:postId/comments/:commentId')
  async updateCommentById(
    @UserInToken('userId') userId: number,
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @Body() dto: UpdateCommentByIdDto,
  ) {
    return await this.postService.updateCommentById(
      userId,
      postId,
      commentId,
      dto,
    );
  }

  @Delete('/:postId/comments/:commentId')
  async deleteCommentById(
    @UserInToken('userId') userId: number,
    @UserInToken('role') role: Role,
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
  ) {
    return await this.postService.deleteCommentById(
      userId,
      role,
      postId,
      commentId,
    );
  }
}
