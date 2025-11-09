import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module';
import { ApiDocsModule } from './common/api-docs/api-docs.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DtoValidationPipe } from './common/pipes/dto-validation.pipe';
import { ServerEnv } from './configurations/server.config';
import { LogCategory, logger } from './libs/logger';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<ServerEnv, true>>(ConfigService);


  app.useGlobalPipes(new DtoValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  const nodeEnv = configService.get<string>('NODE_ENV');
  const port = configService.get<number>('PORT')

  if (nodeEnv !== 'prod') {
    ApiDocsModule.register(app, {
      title: `Example ${nodeEnv} server`,
      description: `Example ${nodeEnv} server`,
      version: '1.0.0',
    });
  }

  await app.listen(port, () => {
    logger.info({
      category: LogCategory.INITIALIZE,
      message: `Example ${nodeEnv} server listening to port ${port}`,
    });
  });
}

bootstrap();
