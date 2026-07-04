import { User } from '../../domain/models/user.model';
import { Email } from '../../domain/value-objects/email.vo';
import { UserEntity } from './user.orm-entity';

export class UserMapper {
  static toDomain(ormEntity: UserEntity): User {
    return new User(
      ormEntity.id,
      new Email(ormEntity.email),
      ormEntity.password,
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
    ormEntity.version = domain.version;
    ormEntity.createdAt = domain.createdAt;
    ormEntity.updatedAt = domain.updatedAt;
    return ormEntity;
  }
}
