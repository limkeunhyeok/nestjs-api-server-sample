import { User } from '../../../domain/entities/user.model';
import { Email } from '../../../domain/value-objects/email.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import { UserEntity } from '../entities/user.orm-entity';

export class UserMapper {
  static toDomain(ormEntity: UserEntity): User {
    return new User(
      ormEntity.id,
      new Email(ormEntity.email),
      new Password(ormEntity.password),
      ormEntity.name,
      ormEntity.role,
      ormEntity.latestTryLoginDate,
      ormEntity.version,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrm(domain: User): UserEntity {
    const ormEntity = new UserEntity();
    if (domain.id && domain.id > 0) {
      ormEntity.id = domain.id;
    }
    ormEntity.email = domain.email;
    ormEntity.password = domain.passwordHash;
    ormEntity.name = domain.name;
    ormEntity.role = domain.role;
    ormEntity.latestTryLoginDate = domain.latestTryLoginDate;
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
