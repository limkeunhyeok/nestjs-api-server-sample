import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { serverConfig } from 'src/config';
import { TokenPayload, verifyToken } from 'src/libs/token';
import { Role } from 'src/modules/users/user.entity';

const isRoleIncluded = (role: string) => {
  if (Object.values(Role).includes(role as Role)) {
    return true;
  }
  return false;
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization;

    if (authHeaders && authHeaders.split(' ')[1]) {
      const token = authHeaders.split(' ')[1];

      const decoded: TokenPayload = verifyToken(token, serverConfig.secretKey);

      if (!isRoleIncluded(decoded.role)) {
        throw new UnauthorizedException(`${decoded.role} is not a valid role.`);
      }

      req['user'] = { userId: decoded.userId, role: decoded.role };
      return next();
    }

    throw new UnauthorizedException('Invalid token.');
  }
}
