import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { ApiException } from '../../common/exceptions/api.exception';
import { NextFunction, Request, Response } from 'express';
import { buildAuthAccessTokenCacheKey } from 'src/common/cache/auth.cache-key';
import { MISSING_AUTHORIZATION_HEADER } from 'src/common/constants/exception-message.const';
import { TOKEN_TYPE_DEV } from 'src/modules/auth/auth.const';
import {
  AccessTokenPayload,
  DevTokenPayload,
} from 'src/modules/auth/auth.interface';
import { AuthService } from 'src/modules/auth/application/auth.service';
import { ActiveUsersService } from './active-users.service';
import { DevTokenService } from './dev-token.service';
import { TokenBlacklistService } from './token-blacklist.service';

export interface RequestWithUser extends Request {
  user?: AccessTokenPayload;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly devTokenService: DevTokenService,
    private readonly activeUsersService: ActiveUsersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    // Exclude well-known completely in middleware as a fallback
    if (req.path.startsWith('/.well-known')) {
      return next();
    }

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      console.log(
        'AuthMiddleware: MISSING_AUTHORIZATION_HEADER, path:',
        req.path,
        'headers:',
        req.headers,
      );
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        MISSING_AUTHORIZATION_HEADER,
      );
    }

    const token = this.authService.extractTokenFromBearer(rawToken);

    const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(token);
    if (isBlacklisted) {
      console.log('AuthMiddleware: Token has been revoked.');
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'Token has been revoked.',
      );
    }

    const tokenKey = buildAuthAccessTokenCacheKey(token);
    const cachePayload =
      await this.cacheManager.get<AccessTokenPayload>(tokenKey);

    if (cachePayload) {
      req.user = cachePayload;
      await this.activeUsersService.trackUser(cachePayload.sub);
      return next();
    }

    const payload = await this.authService.parseBearerToken(rawToken, {
      isRefreshToken: false,
    });

    if (payload.type === TOKEN_TYPE_DEV) {
      const devPayload = payload as DevTokenPayload;
      const jti = devPayload.jti;
      if (!jti) {
        throw new ApiException(
          HttpStatus.UNAUTHORIZED,
          'Invalid dev token: missing jti.',
        );
      }
      const isRevoked = await this.devTokenService.isDevTokenRevoked(jti);
      if (isRevoked) {
        throw new ApiException(
          HttpStatus.UNAUTHORIZED,
          'Dev token has been revoked.',
        );
      }
    }

    const expiryDate = new Date(payload.exp * 1000).getTime();
    const now = Date.now();
    const differenceInSeconds = (expiryDate - now) / 1000;

    await this.cacheManager.set(
      tokenKey,
      payload,
      Math.max((differenceInSeconds - 30) * 1000, 1),
    );

    req.user = payload;

    await this.activeUsersService.trackUser(payload.sub);

    return next();
  }
}
