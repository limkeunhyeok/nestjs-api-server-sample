import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module';
import { ApiDocsModule } from './common/api-docs/api-docs.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ExtendedLogger } from './common/interfaces/extended-logger.interface';
import { DtoValidationPipe } from './common/pipes/dto-validation.pipe';
import { NodeEnv, ServerEnv } from './configurations/server.config';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get<ExtendedLogger>(WINSTON_MODULE_NEST_PROVIDER);

  const configService = app.get<ConfigService<ServerEnv, true>>(ConfigService);

  app.useLogger(logger);

  app.useGlobalPipes(new DtoValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  const nodeEnv = configService.get<string>('NODE_ENV');
  const port = configService.get<number>('PORT')

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
