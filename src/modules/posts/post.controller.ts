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
import { CreatePostDto } from './dto/create.dto';
import { GetPostsByQueryDto } from './dto/get.dto';
import { UpdatePostByIdDto } from './dto/update.dto';
import { PostService } from './post.service';

@ApiTags('posts')
@ApiBearerAuth('accessToken')
@UseGuards(RoleGuard([Role.ADMIN, Role.MEMBER]))
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async create(
    @Body() dto: CreatePostDto,
    @UserInToken('userId') userId: number,
  ) {
    return await this.postService.create(userId, dto);
  }

  @Get()
  async getByQuery(@Query() query: GetPostsByQueryDto) {
    return await this.postService.getByQuery(query);
  }

  @Get('/:postId')
  async getById(@Param('postId') postId: number) {
    return await this.postService.getById(postId);
  }

  @Put('/:postId')
  async updateById(
    @Param('postId') postId: number,
    @Body() dto: UpdatePostByIdDto,
  ) {
    return await this.postService.updateById(postId, dto);
  }

  @Delete('/:postId')
  async deleteById(@Param('postId') postId: number) {
    return await this.postService.deleteById(postId);
  }
}
