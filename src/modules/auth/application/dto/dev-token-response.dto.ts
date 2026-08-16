import { Role } from 'src/common/constants/role.const';
import { DevTokenOrmEntity } from '../../infrastructure/persistence/entities/dev-token.orm-entity';

export class DevTokenResponseDto {
  id: number;
  name: string;
  jti: string;
  role: Role;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  version?: number;

  static fromEntity(entity: DevTokenOrmEntity): DevTokenResponseDto {
    const dto = new DevTokenResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.jti = entity.jti;
    dto.role = entity.role;
    dto.expiresAt = entity.expiresAt;
    dto.revokedAt = entity.revokedAt;
    dto.createdBy = entity.createdBy;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.version = entity.version;
    return dto;
  }
}
