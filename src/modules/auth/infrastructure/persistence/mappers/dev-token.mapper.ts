import { DevToken } from '../../../domain/entities/dev-token.model';
import { DevTokenOrmEntity } from '../entities/dev-token.orm-entity';

export class DevTokenMapper {
  static toDomain(ormEntity: DevTokenOrmEntity): DevToken {
    return new DevToken(
      ormEntity.id,
      ormEntity.name,
      ormEntity.jti,
      ormEntity.role,
      ormEntity.expiresAt,
      ormEntity.createdBy,
      ormEntity.revokedAt,
      ormEntity.version,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrmEntity(domain: DevToken): DevTokenOrmEntity {
    const ormEntity = new DevTokenOrmEntity();
    if (domain.id) {
      ormEntity.id = domain.id;
    }
    ormEntity.name = domain.name;
    ormEntity.jti = domain.jti;
    ormEntity.role = domain.role;
    ormEntity.expiresAt = domain.expiresAt;
    ormEntity.revokedAt = domain.revokedAt;
    ormEntity.createdBy = domain.createdBy;
    if (domain.version !== undefined) {
      ormEntity.version = domain.version;
    }
    if (domain.createdAt) {
      ormEntity.createdAt = domain.createdAt;
    }
    if (domain.updatedAt) {
      ormEntity.updatedAt = domain.updatedAt;
    }
    return ormEntity;
  }
}
