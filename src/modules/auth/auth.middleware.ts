import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { buildAuthAccessTokenCacheKey } from 'src/common/cache/auth.cache-key';
import { MISSING_AUTHORIZATION_HEADER } from 'src/common/constants/exception-message.const';
import { AccessTokenPayload } from 'src/modules/auth/auth.interface';
import { AuthService } from 'src/modules/auth/auth.service';

export interface RequestWithUser extends Request {
  user?: AccessTokenPayload;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException(MISSING_AUTHORIZATION_HEADER);
    }

    const token = this.authService.extractTokenFromBearer(rawToken);

    const tokenKey = buildAuthAccessTokenCacheKey(token);

    const cachePayload =
      await this.cacheManager.get<AccessTokenPayload>(tokenKey);

    if (cachePayload) {
      req.user = cachePayload;
      return next();
    }

    const payload = await this.authService.parseBearerToken(rawToken, {
      isRefreshToken: false,
    });

    const expiryDate = new Date(payload.exp * 1000).getTime();
    const now = Date.now();

    const differenceInSeconds = (expiryDate - now) / 1000;

    await this.cacheManager.set(
      tokenKey,
      payload,
      Math.max((differenceInSeconds - 30) * 1000, 1),
    );

    req.user = payload;

    return next();
  }
}
