import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { errors } from 'jose';
import {
  INVALID_AUTHORIZATION_HEADER_FORMAT,
  INVALID_CREDENTIALS,
  INVALID_EMAIL_OR_PASSWORD,
  INVALID_OR_MALFORMED_TOKEN,
  TOKEN_EXPIRED,
  TOKEN_TYPE_MISMATCH,
} from 'src/common/constants/exception-message.const';
import { Role } from 'src/common/constants/role.const';
import { generateRandomString } from 'src/libs/string';
import { JoseJwtService } from '../jose-jwt/jose-jwt.service';
import { UserEntity } from '../users/user.entity';
import { UserService } from '../users/user.service';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  AUTH_SCHEME_BEARER,
  REFRESH_TOKEN_EXPIRES_IN,
  TOKEN_TYPE_ACCESS,
  TOKEN_TYPE_REFRESH,
} from './auth.const';
import {
  AccessTokenPayload,
  AuthTokens,
  RefreshTokenPayload,
} from './auth.interface';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly joseJwtService: JoseJwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async parseBearerToken(rawToken: string): Promise<AccessTokenPayload>;
  async parseBearerToken(
    rawToken: string,
    options: {
      isRefreshToken: true;
      isRawToken?: boolean;
    },
  ): Promise<RefreshTokenPayload>;
  async parseBearerToken(
    rawToken: string,
    options:
      | {
          isRefreshToken?: false;
          isRawToken?: boolean;
        }
      | undefined,
  ): Promise<AccessTokenPayload>;
  async parseBearerToken(
    rawToken: string,
    options?: {
      isRefreshToken?: boolean;
      isRawToken?: boolean;
    },
  ): Promise<AccessTokenPayload | RefreshTokenPayload> {
    const token = options?.isRawToken
      ? rawToken
      : this.extractTokenFromBearer(rawToken);

    const isRefreshToken = options?.isRefreshToken ?? false;

    try {
      const payload = await this.joseJwtService.verify(token);

      if (isRefreshToken) {
        if (payload.type !== TOKEN_TYPE_REFRESH) {
          throw new UnauthorizedException(TOKEN_TYPE_MISMATCH);
        }
        return payload as RefreshTokenPayload;
      }

      if (payload.type !== TOKEN_TYPE_ACCESS) {
        throw new UnauthorizedException(TOKEN_TYPE_MISMATCH);
      }
      return payload as AccessTokenPayload;
    } catch (error: unknown) {
      if (error instanceof errors.JWTExpired) {
        throw new UnauthorizedException(TOKEN_EXPIRED);
      }
      throw new UnauthorizedException(INVALID_OR_MALFORMED_TOKEN);
    }
  }

  async issueToken(
    user: {
      id: number;
      role: Role;
    },
    options?: {
      isRefreshToken?: boolean;
    },
  ): Promise<string> {
    const isRefreshToken = options?.isRefreshToken ?? false;

    const expiresIn = isRefreshToken
      ? REFRESH_TOKEN_EXPIRES_IN
      : ACCESS_TOKEN_EXPIRES_IN;

    const payload: {
      sub: string;
      role?: Role;
      type: typeof TOKEN_TYPE_ACCESS | typeof TOKEN_TYPE_REFRESH;
    } = {
      sub: user.id.toString(),
      type: isRefreshToken ? TOKEN_TYPE_REFRESH : TOKEN_TYPE_ACCESS,
    };

    if (!isRefreshToken) {
      payload.role = user.role;
    }

    return await this.joseJwtService.sign(payload, expiresIn);
  }

  async authenticateUser(params: {
    email: string;
    password: string;
  }): Promise<UserEntity> {
    const { email, password } = params;

    let user: UserEntity;

    try {
      user = await this.userService.getUserByEmail(email);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(INVALID_EMAIL_OR_PASSWORD);
      }
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException(INVALID_EMAIL_OR_PASSWORD);
    }

    return user;
  }

  async loginUser(params: {
    email: string;
    password: string;
  }): Promise<AuthTokens> {
    const user = await this.authenticateUser(params);

    const accessToken = await this.issueToken(user, { isRefreshToken: false });
    const refreshToken = await this.issueToken(user, { isRefreshToken: true });

    return { accessToken, refreshToken };
  }

  async registerUser(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthTokens> {
    const user = await this.userService.createUser({
      ...params,
      role: Role.MEMBER,
    });

    const accessToken = await this.issueToken(user, { isRefreshToken: false });
    const refreshToken = await this.issueToken(user, { isRefreshToken: true });

    return {
      accessToken,
      refreshToken,
    };
  }

  async getAuthorizedUserById(userId: number): Promise<UserEntity> {
    try {
      return await this.userService.getUserById(userId);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException(INVALID_CREDENTIALS);
      }
      throw error;
    }
  }

  async refreshTokens(params: { refreshToken: string }): Promise<AuthTokens> {
    const { refreshToken } = params;

    const payload = await this.parseBearerToken(refreshToken, {
      isRefreshToken: true,
      isRawToken: true,
    });

    const userId = Number(payload.sub);

    const user = await this.getAuthorizedUserById(userId);

    const accessToken = await this.issueToken(user, { isRefreshToken: false });
    const newRefreshToken = await this.issueToken(user, {
      isRefreshToken: true,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async resetPassword(params: {
    email: string;
  }): Promise<{ newPassword: string }> {
    const { email } = params;

    const user = await this.userService.getUserByEmail(email);

    const randomPassword = generateRandomString(8);

    await this.userService.resetUserPassword({
      userId: user.id,
      newPassword: randomPassword,
    });

    return { newPassword: randomPassword };
  }

  async logout(rawToken: string): Promise<void> {
    const token = this.extractTokenFromBearer(rawToken);
    const payload = await this.parseBearerToken(rawToken);

    const expirySeconds = payload.exp - Math.floor(Date.now() / 1000);

    if (expirySeconds > 0) {
      await this.tokenBlacklistService.blacklist(token, expirySeconds);
    }
  }

  extractTokenFromBearer(rawToken: string): string {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new UnauthorizedException(INVALID_AUTHORIZATION_HEADER_FORMAT);
    }

    const parts = rawToken.split(' ');
    if (parts.length !== 2) {
      throw new UnauthorizedException(INVALID_AUTHORIZATION_HEADER_FORMAT);
    }

    const [bearer, token] = parts;
    if (bearer.toLowerCase() !== AUTH_SCHEME_BEARER) {
      throw new UnauthorizedException(INVALID_AUTHORIZATION_HEADER_FORMAT);
    }
    return token;
  }
}
