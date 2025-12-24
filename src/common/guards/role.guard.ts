import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isNil } from 'lodash';
import { AccessTokenPayload } from 'src/modules/auth/auth.interface';
import { RequestWithUser } from 'src/modules/auth/auth.middleware';
import {
  FORBIDDEN_RESOURCE_MODIFICATION,
  INVALID_CREDENTIALS,
} from '../constants/exception-message.const';
import { Role } from '../constants/role.const';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Role[]>(Roles, context.getHandler());

    // public
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
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const hasRole = roles.includes(user.role);
    if (!hasRole) {
      console.log('??????????????', user);
      throw new ForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    return true;
  }
}
