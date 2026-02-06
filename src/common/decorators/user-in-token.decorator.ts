import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { NullableType } from 'joi';
import { isNil } from 'lodash';
import { AccessTokenPayload } from 'src/modules/auth/auth.interface';
import { RequestWithUser } from 'src/modules/auth/auth.middleware';

export const UserInToken = createParamDecorator(
  (data: NullableType<keyof AccessTokenPayload>, context: ExecutionContext) => {
    const ctx = context.switchToHttp();

    const request = ctx.getRequest<RequestWithUser>();

    if (isNil(request.user)) {
      return undefined;
    }

    if (data) {
      return data === 'sub' ? Number(request.user[data]) : request.user[data];
    }

    return {
      ...request.user,
      sub: Number(request.user.sub),
    };
  },
);
