import { CacheModule } from '@nestjs/cache-manager';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { RoleGuard } from './common/guards/role.guard';
import { HealthCheckModule } from './common/health-check/health-check.module';
import { JoseJwtModule } from './common/jose-jwt/jose-jwt.module';
import { HttpLoggingMiddleware } from './common/middlewares/http-logging.middleware';
import { IgnoreBrowserRequestMiddleware } from './common/middlewares/ignore-browser-request.middleware';
import { JoseJwtConfigService } from './configurations/jose-jwt.config';
import { RedisConfigService } from './configurations/redis.config';
import { ServerEnvValidation } from './configurations/server.config';
import { TypeOrmConfigService } from './configurations/typeorm.config';
import { WinstonConfigService } from './configurations/winston.config';
import { AuthMiddleware } from './modules/auth/auth.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/posts/post.module';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: ServerEnvValidation,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    WinstonModule.forRootAsync({
      imports: [],
      useClass: WinstonConfigService,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: RedisConfigService,
    }),
    JoseJwtModule.registerAsync({
      global: true,
      useClass: JoseJwtConfigService,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    UserModule,
    AuthModule,
    HealthCheckModule,
    PostModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
      .apply(IgnoreBrowserRequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET })
      .apply(AuthMiddleware)
      .exclude(
        { path: '/auth/login', method: RequestMethod.POST },
        { path: '/auth/register', method: RequestMethod.POST },
        { path: '/auth/refresh', method: RequestMethod.POST },
        { path: '/auth/forgot-password', method: RequestMethod.POST },
        { path: '/health-check/(.*)', method: RequestMethod.GET },
        { path: '/.well-known/(.*)', method: RequestMethod.GET },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
