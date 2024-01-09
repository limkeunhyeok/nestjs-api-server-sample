import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { serverConfig } from 'src/config';
import { verifyToken } from 'src/libs/token';
import { UserService } from 'src/modules/users/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization;

    if (authHeaders && authHeaders.split(' ')[1]) {
      const token = authHeaders.split(' ')[1];

      const decoded: JwtPayload = verifyToken(token, serverConfig.secretKey);

      const user = await this.userService.getById(decoded.userId);

      req['user'] = { userId: user.id, role: user.role };
      return next();
    }

    throw new UnauthorizedException('Invalid token.');
  }
}
