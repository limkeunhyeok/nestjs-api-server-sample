import { UserMapper } from 'src/modules/users/infrastructure/persistence/mappers/user.mapper';
import { Post } from '../../../domain/entities/post.model';
import { PostOrmEntity } from '../entities/post.orm-entity';
import { CommentMapper } from './comment.mapper';

export class PostMapper {
  static toDomain(ormEntity: PostOrmEntity): Post {
    return new Post(
      ormEntity.id,
      ormEntity.title,
      ormEntity.contents,
      ormEntity.published,
      ormEntity.authorId,
      ormEntity.author ? UserMapper.toDomain(ormEntity.author) : undefined,
      ormEntity.comments
        ? ormEntity.comments.map((c) => CommentMapper.toDomain(c))
        : undefined,
      ormEntity.version,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrm(domain: Post): PostOrmEntity {
    const ormEntity = new PostOrmEntity();
    if (domain.id && domain.id > 0) {
      ormEntity.id = domain.id;
    }
    ormEntity.title = domain.title;
    ormEntity.contents = domain.contents;
    ormEntity.published = domain.published;
    ormEntity.authorId = domain.authorId;
    if (domain.author) {
      ormEntity.author = UserMapper.toOrm(domain.author);
    }
    if (domain.comments) {
      ormEntity.comments = domain.comments.map((c) => CommentMapper.toOrm(c));
    }
    if (domain.version !== undefined) {
      ormEntity.version = domain.version;
    }
    if (domain.createdAt !== undefined) {
      ormEntity.createdAt = domain.createdAt;
    }
    if (domain.updatedAt !== undefined) {
      ormEntity.updatedAt = domain.updatedAt;
    }
    return ormEntity;
  }
}
