import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ApiException } from '../exceptions/api.exception';
import { Reflector } from '@nestjs/core';
import { isNil } from 'lodash';
import { AccessTokenPayload } from 'src/modules/auth/auth.interface';
import { RequestWithUser } from 'src/modules/auth/auth.middleware';
import {
  FORBIDDEN_RESOURCE_MODIFICATION,
  INVALID_CREDENTIALS,
} from '../constants/exception-message.const';
import { Role } from '../constants/role.const';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const roles = this.reflector.getAllAndOverride<Role[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    // public (no Roles explicitly provided, and no Public either indicates default public by the current logic, though typically no Roles means public if not strictly guarded)
    if (!roles) {
      return true;
    }

    const ctx = context.switchToHttp();

    const request = ctx.getRequest<RequestWithUser>();

    const user = request.user as AccessTokenPayload;

    // Roles([]): 최소 로그인 필요
    if (!roles.length && !isNil(user)) {
      return true;
    }

    if (isNil(user)) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS);
    }

    const hasRole = roles.includes(user.role);
    if (!hasRole) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        FORBIDDEN_RESOURCE_MODIFICATION,
      );
    }

    return true;
  }
}
