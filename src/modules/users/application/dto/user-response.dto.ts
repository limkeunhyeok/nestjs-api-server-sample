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

    // 캐시 저장 시 plain 객체가 되어 getter 가 소멸했을 경우를 대비한 Reflect 기반 방어 추출
    const emailRaw = Reflect.get(user, '_email') as unknown;
    const nameRaw = Reflect.get(user, '_name') as unknown;
    const roleRaw = Reflect.get(user, '_role') as unknown;
    const latestTryLoginDateRaw = Reflect.get(
      user,
      '_latestTryLoginDate',
    ) as unknown;
    const versionRaw = Reflect.get(user, '_version') as unknown;

    let emailValue = '';
    if (emailRaw) {
      if (
        typeof emailRaw === 'object' &&
        emailRaw !== null &&
        'value' in emailRaw
      ) {
        const val = Reflect.get(emailRaw as Record<string, unknown>, 'value');
        emailValue = typeof val === 'string' ? val : '';
      } else if (typeof emailRaw === 'string') {
        emailValue = emailRaw;
      }
    }

    dto.email = user.email || emailValue;
    dto.name = user.name || (typeof nameRaw === 'string' ? nameRaw : '');
    dto.role = user.role || (roleRaw as Role);

    let latestTryLoginDate: Date | null = null;
    if (user.latestTryLoginDate !== undefined) {
      latestTryLoginDate = user.latestTryLoginDate;
    } else if (latestTryLoginDateRaw instanceof Date) {
      latestTryLoginDate = latestTryLoginDateRaw;
    } else if (
      typeof latestTryLoginDateRaw === 'string' ||
      typeof latestTryLoginDateRaw === 'number'
    ) {
      latestTryLoginDate = new Date(latestTryLoginDateRaw);
    }
    dto.latestTryLoginDate = latestTryLoginDate;

    dto.version =
      user.version !== undefined
        ? user.version
        : typeof versionRaw === 'number'
          ? versionRaw
          : 0;

    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
