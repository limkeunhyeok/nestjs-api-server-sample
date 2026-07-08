import { isEmptyObject } from 'src/libs/validator';
import { PostOrmEntity } from 'src/modules/posts/infrastructure/persistence/entities/post.orm-entity';

export function expectPostResponseSucceed(
  result: Partial<PostOrmEntity>,
  postRaw: Partial<PostOrmEntity> = {},
) {
  expect(result).toHaveProperty('id');
  expect(result).toHaveProperty('title');
  expect(result).toHaveProperty('contents');
  expect(result).toHaveProperty('published');
  expect(result).toHaveProperty('author');
  expect(result).toHaveProperty('createdAt');
  expect(result).toHaveProperty('updatedAt');
  expect(result).toHaveProperty('version');

  if (!isEmptyObject(postRaw)) {
    expect(result.title).toBe(postRaw.title);
    expect(result.contents).toBe(postRaw.contents);
  }
}
