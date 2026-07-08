import { UserMapper } from 'src/modules/users/infrastructure/persistence/mappers/user.mapper';
import { Comment } from '../../../domain/entities/comment.model';
import { CommentOrmEntity } from '../entities/comment.orm-entity';
import { PostMapper } from './post.mapper';

export class CommentMapper {
  static toDomain(ormEntity: CommentOrmEntity): Comment {
    return new Comment(
      ormEntity.id,
      ormEntity.contents,
      ormEntity.published,
      ormEntity.authorId,
      ormEntity.author ? UserMapper.toDomain(ormEntity.author) : undefined,
      ormEntity.post ? PostMapper.toDomain(ormEntity.post) : undefined,
      ormEntity.version,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrm(domain: Comment): CommentOrmEntity {
    const ormEntity = new CommentOrmEntity();
    if (domain.id && domain.id > 0) {
      ormEntity.id = domain.id;
    }
    ormEntity.contents = domain.contents;
    ormEntity.published = domain.published;
    ormEntity.authorId = domain.authorId;
    if (domain.author) {
      ormEntity.author = UserMapper.toOrm(domain.author);
    }
    if (domain.post) {
      ormEntity.post = PostMapper.toOrm(domain.post);
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
