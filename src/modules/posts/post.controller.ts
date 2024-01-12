import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from '../users/user.entity';
import { PostService } from './post.service';

@ApiTags('posts')
@ApiBearerAuth('accessToken')
@UseGuards(RoleGuard([Role.ADMIN, Role.MEMBER]))
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}
}
