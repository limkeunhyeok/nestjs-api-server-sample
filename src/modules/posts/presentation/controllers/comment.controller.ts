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
import { CommentResponseDto } from '../../application/dto/comment-response.dto';
import { CreateCommentDto } from '../../application/dto/create-comment.dto';
import { PaginateCommentsDto } from '../../application/dto/paginate-comments.dto';
import { UpdateCommentDto } from '../../application/dto/update-comment.dto';
import { CommentService } from '../../application/services/comment.service';

@ApiTags('posts')
@ApiBearerAuth('accessToken')
@UseInterceptors(ClassSerializerInterceptor)
@Roles([Role.ADMIN, Role.MEMBER])
@Controller('posts')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/:postId/comments')
  async create(
    @Param('postId') postId: number,
    @Body() body: CreateCommentDto,
    @UserInToken('sub') userId: number,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentService.createComment({
      userId,
      postId,
      ...body,
    });
    return CommentResponseDto.fromDomain(comment);
  }

  @Get('/:postId/comments')
  async paginate(
    @Param('postId') postId: number,
    @Query() query: PaginateCommentsDto,
  ): Promise<PaginationResponse<CommentResponseDto>> {
    const paginated = await this.commentService.paginateComments({
      postId,
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
    return {
      ...paginated,
      data: paginated.data.map((c) => CommentResponseDto.fromDomain(c)),
    };
  }

  @Get('/:postId/comments/:commentId')
  async getOneById(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentService.getCommentById(postId, commentId);
    return CommentResponseDto.fromDomain(comment);
  }

  @Put('/:postId/comments/:commentId')
  async update(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @Body() body: UpdateCommentDto,
    @UserInToken() payload: AuthUser,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentService.updateComment(
      postId,
      commentId,
      body,
      payload,
    );
    return CommentResponseDto.fromDomain(comment);
  }

  @Delete('/:postId/comments/:commentId')
  async delete(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @UserInToken() payload: AuthUser,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentService.deleteComment(
      postId,
      commentId,
      payload,
    );
    return CommentResponseDto.fromDomain(comment);
  }
}
