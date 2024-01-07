import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HttpLoggingMiddleware } from './common/middlewares/http-logging.middleware';
import { UserEntity } from './modules/users/user.entity';
import { UserModule } from './modules/users/user.module';
import { getDbConfig } from './typeorm/db.config';
import { initializeData } from './typeorm/initialize';

@Module({
  imports: [TypeOrmModule.forRoot(getDbConfig([UserEntity])), UserModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly datasource: DataSource) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }

  async onModuleInit() {
    await initializeData(this.datasource);
  }
}
