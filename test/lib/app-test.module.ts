import {
  LoggerService,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { RolesGuard } from 'src/common/guards/role.guard';
import { HealthCheckModule } from 'src/common/health-check/health-check.module';
import { ServerEnvValidation } from 'src/configurations/server.config';
import { AuthMiddleware } from 'src/modules/auth/auth.middleware';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PostModule } from 'src/modules/posts/post.module';
import { UserModule } from 'src/modules/users/user.module';
import { TypeOrmConfigService } from './typeorm-test.config';

const mockLogger: LoggerService = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

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
    HealthCheckModule,
    UserModule,
    AuthModule,
    PostModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: WINSTON_MODULE_NEST_PROVIDER,
      useValue: mockLogger,
    },
  ],
})
export class AppTestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/auth/login', method: RequestMethod.POST },
        { path: '/auth/register', method: RequestMethod.POST },
        { path: '/auth/refresh', method: RequestMethod.POST },
        { path: '/auth/forgot-password', method: RequestMethod.POST },
        { path: '/health-check/(.*)', method: RequestMethod.GET },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
