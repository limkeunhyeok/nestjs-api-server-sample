import { Role } from 'src/common/constants/role.const';
import { DevToken } from '../../domain/entities/dev-token.model';

export class DevTokenResponseDto {
  id: number;
  name: string;
  jti: string;
  role: Role;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;

  static fromDomain(domain: DevToken): DevTokenResponseDto {
    const dto = new DevTokenResponseDto();
    dto.id = domain.id;
    dto.name = domain.name;
    dto.jti = domain.jti;
    dto.role = domain.role;
    dto.expiresAt = domain.expiresAt;
    dto.revokedAt = domain.revokedAt;
    dto.createdBy = domain.createdBy;
    dto.createdAt = domain.createdAt;
    dto.updatedAt = domain.updatedAt;
    dto.version = domain.version;
    return dto;
  }
}
