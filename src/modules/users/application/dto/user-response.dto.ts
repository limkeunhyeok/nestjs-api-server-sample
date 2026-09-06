import { Role } from 'src/common/constants/role.const';
import { User } from 'src/modules/users/domain/entities/user.model';

export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  role: Role;
  latestTryLoginDate?: Date | null;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    dto.role = user.role;
    dto.latestTryLoginDate = user.latestTryLoginDate;
    dto.version = user.version;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
