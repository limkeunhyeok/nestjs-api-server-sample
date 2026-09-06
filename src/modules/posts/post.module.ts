import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../users/user.module';
import { CommentService } from './application/services/comment.service';
import { PostService } from './application/services/post.service';
import { COMMENT_REPOSITORY_PORT } from './domain/repository-ports/comment.repository.port';
import { POST_REPOSITORY_PORT } from './domain/repository-ports/post.repository.port';
import { CommentRepositoryAdapter } from './infrastructure/persistence/comment.repository.adapter';
import { CommentOrmEntity } from './infrastructure/persistence/entities/comment.orm-entity';
import { PostOrmEntity } from './infrastructure/persistence/entities/post.orm-entity';
import { PostRepositoryAdapter } from './infrastructure/persistence/post.repository.adapter';
import { CommentController } from './presentation/controllers/comment.controller';
import { PostController } from './presentation/controllers/post.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostOrmEntity, CommentOrmEntity]),
    UserModule,
  ],
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
