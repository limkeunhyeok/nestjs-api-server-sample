import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { serverConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(serverConfig.port, () => {
    console.log(
      `Example ${serverConfig.nodeEnv} server listening to port ${serverConfig.port}`,
    );
  });
}
bootstrap();
