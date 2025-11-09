import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { HealthCheckModule } from './common/health-check/health-check.module';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { HttpLoggingMiddleware } from './common/middlewares/http-logging.middleware';
import { ServerEnv, ServerEnvValidation } from './configurations/server.config';
import { AuthModule } from './modules/auth/auth.module';
import { CommentEntity } from './modules/comments/comment.entity';
import { PostEntity } from './modules/posts/post.entity';
import { PostModule } from './modules/posts/post.module';
import { UserEntity } from './modules/users/user.entity';
import { UserModule } from './modules/users/user.module';
import { getDbConfig } from './typeorm/db.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV ?? 'dev'}`,
      validationSchema: ServerEnvValidation,
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService<ServerEnv, true>) {
        return getDbConfig(configService, [UserEntity, PostEntity, CommentEntity]);
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
export class AppModule implements NestModule {
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
}
