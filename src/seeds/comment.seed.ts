import { NestFactory } from '@nestjs/core';
import * as faker from 'faker';
import { AppModule } from 'src/app.module';
import { Role } from 'src/common/constants/role.const';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { CommentService } from 'src/modules/posts/application/services/comment.service';
import { PostService } from 'src/modules/posts/application/services/post.service';
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

  const userService = app.get<UserService>(UserService);
  const postService = app.get<PostService>(PostService);
  const commentService = app.get<CommentService>(CommentService);

  const { data: users } = await userService.paginateUsers({
    role: Role.MEMBER,
    limit: 10,
    offset: 0,
    sortField: 'createdAt',
    sortDirection: SortDirection.DESC,
  });

  const { data: posts } = await postService.paginatePosts({
    limit: 10000,
    offset: 0,
    sortField: 'createdAt',
    sortDirection: SortDirection.DESC,
  });

  for (let i = 0; i < posts.length; i++) {
    const randomUser = faker.random.arrayElement(users);
    const randomPost = faker.random.arrayElement(posts);
    const randomNumber = faker.datatype.number({ max: 10, min: 3 });

    const commentRaws = Array.from({ length: randomNumber }).map(() => ({
      userId: randomUser.id,
      postId: randomPost.id,
      contents: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
    }));

    for (const commentRaw of commentRaws) {
      await commentService.createComment(commentRaw);
    }
  }

  await app.close();
}
bootstrap();
