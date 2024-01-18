import { NestFactory } from '@nestjs/core';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module';
import { ApiDocsModule } from './common/api-docs/api-docs.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DtoValidationPipe } from './common/pipes/dto-validation.pipe';
import { serverConfig } from './config';
import { LogCategory, logger } from './libs/logger';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new DtoValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  if (serverConfig.nodeEnv !== 'prod') {
    ApiDocsModule.register(app, {
      title: `Example ${serverConfig.nodeEnv} server`,
      description: `Example ${serverConfig.nodeEnv} server`,
      version: '1.0.0',
    });
  }

  await app.listen(serverConfig.port, () => {
    logger.info({
      category: LogCategory.INITIALIZE,
      message: `Example ${serverConfig.nodeEnv} server listening to port ${serverConfig.port}`,
    });
  });
}

bootstrap();
