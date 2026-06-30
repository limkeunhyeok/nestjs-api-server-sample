import { isEmptyObject } from 'src/libs/validator';
import { PostEntity } from 'src/modules/posts/infrastructure/persistence/post.orm-entity';

export function expectPostResponseSucceed(
  result: Partial<PostEntity>,
  postRaw: Partial<PostEntity> = {},
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
