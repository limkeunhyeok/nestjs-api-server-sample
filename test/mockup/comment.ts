import * as faker from 'faker';
import { CommentEntity } from 'src/modules/posts/infrastructure/persistence/comment.orm-entity';
import { PostEntity } from 'src/modules/posts/infrastructure/persistence/post.orm-entity';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/user.orm-entity';
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
): Partial<CommentEntity> {
  const now = new Date();

  return {
    contents: faker.lorem.sentence(),
    published,
    author: user as UserEntity,
    post: post as PostEntity,
    createdAt: now,
    updatedAt: now,
  };
}

export async function createComment(
  repository: Repository<CommentEntity>,
  commentRaw: Partial<CommentEntity>,
): Promise<CommentEntity> {
  const data = JSON.parse(JSON.stringify(commentRaw));
  return await repository.save(data);
}
