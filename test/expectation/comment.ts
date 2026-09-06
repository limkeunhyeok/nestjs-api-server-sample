import { isEmptyObject } from 'src/libs/validator';
import { CommentOrmEntity } from 'src/modules/posts/infrastructure/persistence/entities/comment.orm-entity';

export function expectCommentResponseSucceed(
  result: Partial<CommentOrmEntity>,
  commentRaw: Partial<CommentOrmEntity> = {},
) {
  expect(result).toHaveProperty('id');
  expect(result).toHaveProperty('contents');
  expect(result).toHaveProperty('published');
  expect(result).toHaveProperty('author');
  expect(result).toHaveProperty('post');
  expect(result).toHaveProperty('createdAt');
  expect(result).toHaveProperty('updatedAt');
  expect(result).toHaveProperty('version');

  if (!isEmptyObject(commentRaw)) {
    expect(result.contents).toBe(commentRaw.contents);
  }
}
