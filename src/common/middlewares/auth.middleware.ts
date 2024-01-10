import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { serverConfig } from 'src/config';
import { TokenPayload, verifyToken } from 'src/libs/token';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization;

    if (authHeaders && authHeaders.split(' ')[1]) {
      const token = authHeaders.split(' ')[1];

      const decoded: TokenPayload = verifyToken(token, serverConfig.secretKey);

      req['user'] = { userId: decoded.userId, role: decoded.role };
      return next();
    }

    throw new UnauthorizedException('Invalid token.');
  }
}
