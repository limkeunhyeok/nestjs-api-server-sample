import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { serverConfig } from './config';
import { LogCategory, logger } from './libs/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(serverConfig.port, () => {
    logger.info({
      category: LogCategory.INITIALIZE,
      message: `Example ${serverConfig.nodeEnv} server listening to port ${serverConfig.port}`,
    });
  });
}
bootstrap();
