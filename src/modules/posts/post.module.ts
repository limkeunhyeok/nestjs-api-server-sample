import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../users/user.module';
import { CommentController } from './controllers/comment.controller';
import { PostController } from './controllers/post.controller';
import { CommentEntity } from './entities/comment.entity';
import { PostEntity } from './entities/post.entity';
import { CommentService } from './services/comment.service';
import { PostService } from './services/post.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, CommentEntity]), UserModule],
  providers: [PostService, CommentService],
  controllers: [PostController, CommentController],
  exports: [PostService, CommentService],
})
export class PostModule {}
