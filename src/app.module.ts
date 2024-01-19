import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { HealthCheckModule } from './common/health-check/health-check.module';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { HttpLoggingMiddleware } from './common/middlewares/http-logging.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { CommentEntity } from './modules/comments/comment.entity';
import { PostEntity } from './modules/posts/post.entity';
import { PostModule } from './modules/posts/post.module';
import { UserEntity } from './modules/users/user.entity';
import { UserModule } from './modules/users/user.module';
import { getDbConfig } from './typeorm/db.config';
import { initializeData } from './typeorm/initialize';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory() {
        return getDbConfig([UserEntity, PostEntity, CommentEntity]);
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed.');
        }
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    UserModule,
    AuthModule,
    HealthCheckModule,
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly datasource: DataSource) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
      .apply(AuthMiddleware)
      .exclude(
        { path: '/auth/sign-in', method: RequestMethod.POST },
        { path: '/auth/sign-up', method: RequestMethod.POST },
        { path: '/health-check/(.*)', method: RequestMethod.GET },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }

  async onModuleInit() {
    await initializeData(this.datasource);
  }
}
