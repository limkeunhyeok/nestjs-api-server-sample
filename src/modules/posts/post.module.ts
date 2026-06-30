import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../users/user.module';
import { CommentController } from './presentation/comment.controller';
import { PostController } from './presentation/post.controller';
import { CommentEntity } from './infrastructure/persistence/comment.orm-entity';
import { PostEntity } from './infrastructure/persistence/post.orm-entity';
import { CommentService } from './application/services/comment.service';
import { PostService } from './application/services/post.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, CommentEntity]), UserModule],
  providers: [PostService, CommentService],
  controllers: [PostController, CommentController],
  exports: [PostService, CommentService],
})
export class PostModule {}
