import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MISSING_AUTHORIZATION_HEADER } from 'src/common/constants/exception-message.const';
import { AccessTokenPayload } from 'src/modules/auth/auth.interface';
import { AuthService } from 'src/modules/auth/auth.service';

export interface RequestWithUser extends Request {
  user?: AccessTokenPayload;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException(MISSING_AUTHORIZATION_HEADER);
    }

    const payload = await this.authService.parseBearerToken(rawToken, {
      isRefreshToken: false,
    });

    req.user = payload;

    return next();
  }
}
