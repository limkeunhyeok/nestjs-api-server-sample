import * as faker from 'faker';
import { PostEntity } from 'src/modules/posts/infrastructure/persistence/post.orm-entity';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/entities/user.orm-entity';
import { Repository } from 'typeorm';

export function mockCreatePostDto(published = true) {
  return {
    title: faker.lorem.sentence(),
    contents: faker.lorem.text(),
    published,
  };
}

export function mockPostRaw(user: Partial<UserEntity>, published = true) {
  const now = new Date();

  return {
    title: faker.lorem.sentence().slice(0, 100),
    contents: faker.lorem.text(),
    published,
    author: user as UserEntity,
    createdAt: now,
    updatedAt: now,
  };
}

export async function createPost(
  repository: Repository<PostEntity>,
  postRaw: Partial<PostEntity>,
): Promise<PostEntity> {
  const data = JSON.parse(JSON.stringify(postRaw));
  return await repository.save(data);
}
