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
import { AccessTokenPayload } from 'src/modules/auth/auth.interface';
import { Role } from '../../../common/constants/role.const';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { PaginateCommentsDto } from '../dtos/paginate-comments.dto';
import { UpdateCommentDto } from '../dtos/update-comment.dto';
import { CommentService } from '../services/comment.service';

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
  ) {
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
  ) {
    return await this.commentService.paginateComments({
      postId,
      ...query,
    });
  }

  @Get('/:postId/comments/:commentId')
  async getOneById(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
  ) {
    return await this.commentService.getCommentById(postId, commentId);
  }

  @Put('/:postId/comments/:commentId')
  async update(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @Body() body: UpdateCommentDto,
    @UserInToken() payload: AccessTokenPayload,
  ) {
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
    @UserInToken() payload: AccessTokenPayload,
  ) {
    return await this.commentService.deleteComment(postId, commentId, payload);
  }
}
