import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Type,
  mixin,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Role } from 'src/modules/users/user.entity';
import { RequestWithUser } from '../middlewares/auth.middleware';

export const RoleGuard = (roles: Role[]): Type<CanActivate> => {
  @Injectable()
  class UserGuard implements CanActivate {
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      if (!roles.length) {
        return true;
      }

      const req: RequestWithUser = context.switchToHttp().getRequest();

      const user = req.user as {
        userId: number;
        role: Role;
      };

      const { role } = user;

      if (!roles.includes(role)) {
        throw new ForbiddenException('Access is denied.');
      }

      return true;
    }
  }

  const guard = mixin(UserGuard);
  return guard;
};
