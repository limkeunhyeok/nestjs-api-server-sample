import { isEmptyObject } from 'src/libs/validator';
import { CommentEntity } from 'src/modules/comments/comment.entity';

export function expectCommentResponseSucceed(
  result: Partial<CommentEntity>,
  commentRaw: Partial<CommentEntity> = {},
) {
  expect(result).toHaveProperty('id');
  expect(result).toHaveProperty('contents');
  expect(result).toHaveProperty('published');
  expect(result).toHaveProperty('authorId');
  expect(result).toHaveProperty('postId');
  expect(result).toHaveProperty('createdAt');
  expect(result).toHaveProperty('updatedAt');
  expect(result).toHaveProperty('version');

  if (!isEmptyObject(commentRaw)) {
    expect(result.contents).toBe(commentRaw.contents);
  }
}
