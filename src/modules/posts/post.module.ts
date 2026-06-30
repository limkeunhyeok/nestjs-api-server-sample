import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../users/user.module';
import { CommentController } from './presentation/comment.controller';
import { PostController } from './presentation/post.controller';
import { CommentEntity } from './infrastructure/persistence/comment.orm-entity';
import { PostEntity } from './infrastructure/persistence/post.orm-entity';
import { CommentService } from './application/services/comment.service';
import { PostService } from './application/services/post.service';
import { POST_REPOSITORY_PORT } from './domain/repository-ports/post.repository.port';
import { PostRepositoryAdapter } from './infrastructure/persistence/post.repository.adapter';
import { COMMENT_REPOSITORY_PORT } from './domain/repository-ports/comment.repository.port';
import { CommentRepositoryAdapter } from './infrastructure/persistence/comment.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, CommentEntity]), UserModule],
  providers: [
    PostService,
    CommentService,
    {
      provide: POST_REPOSITORY_PORT,
      useClass: PostRepositoryAdapter,
    },
    {
      provide: COMMENT_REPOSITORY_PORT,
      useClass: CommentRepositoryAdapter,
    },
  ],
  controllers: [PostController, CommentController],
  exports: [PostService, CommentService],
})
export class PostModule {}
