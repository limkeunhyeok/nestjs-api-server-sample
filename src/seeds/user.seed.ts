import { NestFactory } from '@nestjs/core';
import * as faker from 'faker';
import { AppModule } from 'src/app.module';
import { Role } from 'src/common/constants/role.const';
import { UserService } from 'src/modules/users/user.service';
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

  const userRaws = Array.from({ length: 10 }).map(() => ({
    email: faker.internet.email(),
    password: 'password',
    name: faker.internet.userName(),
    role: Role.MEMBER,
  }));

  const userService = app.get<UserService>(UserService);

  for (const userRaw of userRaws) {
    await userService.createUser(userRaw);
  }

  await app.close();
}
bootstrap();
