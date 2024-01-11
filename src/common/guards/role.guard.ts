import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Type,
  mixin,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Role } from 'src/modules/users/user.entity';

export const RoleGuard = (roles: Role[]): Type<CanActivate> => {
  @Injectable()
  class UserGuard implements CanActivate {
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      if (!roles.length) {
        return true;
      }

      const req: Request = context.switchToHttp().getRequest();
      const { role } = req['user'];

      if (!roles.includes(role)) {
        throw new ForbiddenException('Access is denied.');
      }

      return true;
    }
  }

  const guard = mixin(UserGuard);
  return guard;
};
