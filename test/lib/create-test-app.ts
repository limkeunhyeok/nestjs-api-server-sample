import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { TypeOrmExceptionFilter } from 'src/common/filters/typeorm-exception.filter';
import { DtoValidationPipe } from 'src/common/pipes/dto-validation.pipe';
import { DataSource } from 'typeorm';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { AppTestModule } from './app-test.module'; // e2e용 모듈

export async function createTestApp(): Promise<{
  app: INestApplication;
  module: TestingModule;
}> {
  // transaction context 초기화
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppTestModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  // datasource 트랜잭셔널 적용
  const dataSource = app.get(DataSource);
  addTransactionalDataSource(dataSource);

  // logger 적용
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // pipes
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new DtoValidationPipe(configService));

  // filters
  app.useGlobalFilters(
    new AllExceptionsFilter(logger),
    new TypeOrmExceptionFilter(logger),
  );

  await app.init();
  return { app, module: moduleRef };
}
