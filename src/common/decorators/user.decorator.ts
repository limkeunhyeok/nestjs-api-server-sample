import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const UserInToken = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return data ? req.user[data] : req.user;
  },
);
