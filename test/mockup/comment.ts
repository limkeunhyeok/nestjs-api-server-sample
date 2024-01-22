import * as faker from 'faker';
import { CommentEntity } from 'src/modules/comments/comment.entity';
import { PostEntity } from 'src/modules/posts/post.entity';
import { UserEntity } from 'src/modules/users/user.entity';
import { Repository } from 'typeorm';

export function mockCreateCommentDto(published = true) {
  return {
    contents: faker.lorem.sentence(),
    published,
  };
}

export function mockCommentRaw(
  user: Partial<UserEntity>,
  post: Partial<PostEntity>,
  published = true,
) {
  const now = new Date();

  return {
    contents: faker.lorem.sentence(),
    published,
    authorId: user.id,
    postId: post.id,
    createdAt: now,
    updatedAt: now,
  };
}

export async function createComment(
  repository: Repository<CommentEntity>,
  commentRaw: Partial<CommentEntity>,
): Promise<PostEntity> {
  const data = JSON.parse(JSON.stringify(commentRaw));
  return await repository.save(data);
}
