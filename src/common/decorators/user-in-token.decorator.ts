import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { NullableType } from 'joi';
import { isNil } from 'lodash';
import { TokenPayload } from 'src/libs/token';
import { RequestWithUser } from '../middlewares/auth.middleware';

export const UserInToken = createParamDecorator(
  (data: NullableType<keyof TokenPayload>, context: ExecutionContext) => {
    const ctx = context.switchToHttp();

    const request = ctx.getRequest<RequestWithUser>();

    if (isNil(request.user)) {
      return undefined;
    }

    return data ? request.user[data] : request.user;
  },
);
