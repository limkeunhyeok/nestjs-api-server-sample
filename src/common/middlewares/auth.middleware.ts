import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { ServerEnv } from 'src/configurations/server.config';
import { TokenPayload, verifyToken } from 'src/libs/token';
import { Role } from 'src/modules/users/user.entity';

export interface RequestWithUser extends Request {
  user?: {
    userId: number;
    role: Role;
  };
}

const isRoleIncluded = (role: string) => {
  if (Object.values(Role).includes(role as Role)) {
    return true;
  }
  return false;
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService<ServerEnv, true>) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization;

    if (authHeaders && authHeaders.split(' ')[1]) {
      const token = authHeaders.split(' ')[1];

      const decoded: TokenPayload = verifyToken(
        token,
        this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      );

      if (!isRoleIncluded(decoded.role)) {
        throw new UnauthorizedException(`${decoded.role} is not a valid role.`);
      }

      req['user'] = { userId: decoded.userId, role: decoded.role };
      return next();
    }

    throw new UnauthorizedException('Invalid token.');
  }
}
