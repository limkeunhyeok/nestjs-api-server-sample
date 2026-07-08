import * as faker from 'faker';
import { CommentOrmEntity } from 'src/modules/posts/infrastructure/persistence/entities/comment.orm-entity';
import { PostOrmEntity } from 'src/modules/posts/infrastructure/persistence/entities/post.orm-entity';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/entities/user.orm-entity';
import { Repository } from 'typeorm';

export function mockCreateCommentDto(published = true) {
  return {
    contents: faker.lorem.sentence(),
    published,
  };
}

export function mockCommentRaw(
  user: Partial<UserEntity>,
  post: Partial<PostOrmEntity>,
  published = true,
): Partial<CommentOrmEntity> {
  const now = new Date();

  return {
    contents: faker.lorem.sentence(),
    published,
    author: user as UserEntity,
    post: post as PostOrmEntity,
    createdAt: now,
    updatedAt: now,
  };
}

export async function createComment(
  repository: Repository<CommentOrmEntity>,
  commentRaw: Partial<CommentOrmEntity>,
): Promise<CommentOrmEntity> {
  const data = JSON.parse(JSON.stringify(commentRaw));
  return await repository.save(data);
}
