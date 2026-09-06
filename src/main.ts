import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DataSource } from 'typeorm';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { AppModule } from './app.module';
import { ApiDocsModule } from './common/api-docs/api-docs.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';
import { ExtendedLogger } from './common/interfaces/extended-logger.interface';
import { DtoValidationPipe } from './common/pipes/dto-validation.pipe';
import { NodeEnv, ServerEnv } from './configurations/server.config';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const dataSource = app.get(DataSource);
  addTransactionalDataSource(dataSource);

  const logger = app.get<ExtendedLogger>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  const configService = app.get<ConfigService<ServerEnv, true>>(ConfigService);
  app.useGlobalPipes(new DtoValidationPipe());
  app.useGlobalFilters(
    new AllExceptionsFilter(logger),
    new TypeOrmExceptionFilter(logger),
  );

  const nodeEnv = configService.get<string>('NODE_ENV');
  const port = configService.get<number>('PORT');

  if (nodeEnv !== NodeEnv.PROD) {
    ApiDocsModule.register(app, {
      title: `Example ${nodeEnv} server`,
      description: `Example ${nodeEnv} server`,
      version: '1.0.0',
    });
  }

  await app.listen(port, () => {
    logger.log({
      context: 'NestApplication',
      message: `Example ${nodeEnv} server listening to port ${port}`,
    });
  });
}

bootstrap();
