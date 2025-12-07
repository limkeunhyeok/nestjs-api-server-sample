import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { HealthCheckModule } from './common/health-check/health-check.module';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { HttpLoggingMiddleware } from './common/middlewares/http-logging.middleware';
import { IgnoreBrowserRequestMiddleware } from './common/middlewares/ignore-browser-request.middleware';
import { ServerEnvValidation } from './configurations/server.config';
import { TypeOrmConfigService } from './configurations/typeorm.config';
import { WinstonConfigService } from './configurations/winston.config';
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
      useClass: WinstonConfigService,
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
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
      .apply(IgnoreBrowserRequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET })
      .apply(AuthMiddleware)
      .exclude(
        { path: '/auth/sign-in', method: RequestMethod.POST },
        { path: '/auth/sign-up', method: RequestMethod.POST },
        { path: '/health-check/(.*)', method: RequestMethod.GET },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
