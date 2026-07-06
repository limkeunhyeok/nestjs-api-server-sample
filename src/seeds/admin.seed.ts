import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { Role } from 'src/common/constants/role.const';
import { ServerEnv } from 'src/configurations/server.config';
import { UserService } from 'src/modules/users/application/services/user.service';
import { DataSource } from 'typeorm';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);
  addTransactionalDataSource(dataSource);

  const configService = app.get<ConfigService<ServerEnv, true>>(ConfigService);

  const adminEmail =
    configService.get<string>('ADMIN_EMAIL') ?? 'admin@example.com';
  const adminPassword =
    configService.get<string>('ADMIN_PASSWORD') ?? 'password';
  const adminName = configService.get<string>('ADMIN_NAME') ?? 'admin';

  const userService = app.get<UserService>(UserService);

  await userService.createUser({
    email: adminEmail,
    password: adminPassword,
    name: adminName,
    role: Role.ADMIN,
  });

  await app.close();
}
bootstrap();
