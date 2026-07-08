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
import { Role } from 'src/common/constants/role.const';
import { CreateCommentDto } from '../../application/dto/create-comment.dto';
import { PaginateCommentsDto } from '../../application/dto/paginate-comments.dto';
import { UpdateCommentDto } from '../../application/dto/update-comment.dto';
import { CommentEntity } from '../../infrastructure/persistence/comment.orm-entity';
import { CommentService } from '../../application/services/comment.service';

@ApiTags('posts')
@ApiBearerAuth('accessToken')
@UseInterceptors(ClassSerializerInterceptor) // author password
@Roles([Role.ADMIN, Role.MEMBER])
@Controller('posts')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/:postId/comments')
  async create(
    @Param('postId') postId: number,
    @Body() body: CreateCommentDto,
    @UserInToken('sub') userId: number,
  ): Promise<CommentEntity> {
    return await this.commentService.createComment({
      userId,
      postId,
      ...body,
    });
  }

  @Get('/:postId/comments')
  async paginate(
    @Param('postId') postId: number,
    @Query() query: PaginateCommentsDto,
  ): Promise<PaginationResponse<CommentEntity>> {
    return await this.commentService.paginateComments({
      postId,
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
  }

  @Get('/:postId/comments/:commentId')
  async getOneById(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
  ): Promise<CommentEntity> {
    return await this.commentService.getCommentById(postId, commentId);
  }

  @Put('/:postId/comments/:commentId')
  async update(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @Body() body: UpdateCommentDto,
    @UserInToken() payload: AuthUser,
  ): Promise<CommentEntity> {
    return await this.commentService.updateComment(
      postId,
      commentId,
      body,
      payload,
    );
  }

  @Delete('/:postId/comments/:commentId')
  async delete(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @UserInToken() payload: AuthUser,
  ): Promise<CommentEntity> {
    return await this.commentService.deleteComment(postId, commentId, payload);
  }
}
