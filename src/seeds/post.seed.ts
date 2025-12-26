import { NestFactory } from '@nestjs/core';
import * as faker from 'faker';
import { AppModule } from 'src/app.module';
import { Role } from 'src/common/constants/role.const';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PostService } from 'src/modules/posts/services/post.service';
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

  const userService = app.get<UserService>(UserService);
  const postService = app.get<PostService>(PostService);

  const { data: users } = await userService.paginateUsers({
    role: Role.MEMBER,
    limit: 10,
    offset: 0,
    sortField: 'createdAt',
    sortDirection: SortDirection.DESC,
  });

  for (let i = 0; i < users.length; i++) {
    const randomUser = faker.random.arrayElement(users);
    const randomNumber = faker.datatype.number({ max: 10, min: 1 });

    const postRaws = Array.from({ length: randomNumber }).map(() => ({
      userId: randomUser.id,
      title: faker.lorem.sentence(),
      contents: faker.lorem.sentences(),
      published: faker.datatype.boolean(),
    }));

    for (const postRaw of postRaws) {
      await postService.createPost(postRaw);
    }
  }

  await app.close();
}
bootstrap();
