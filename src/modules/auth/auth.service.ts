import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  INVALID_AUTHORIZATION_HEADER_FORMAT,
  INVALID_CREDENTIALS,
  INVALID_EMAIL_OR_PASSWORD,
  INVALID_OR_MALFORMED_TOKEN,
  TOKEN_EXPIRED,
  TOKEN_TYPE_MISMATCH,
} from 'src/common/constants/exception-message.const';
import { Role } from 'src/common/constants/role.const';
import { ServerEnv } from 'src/configurations/server.config';
import { generateRandomString } from 'src/libs/string';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ServerEnv, true>,
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
      const secret = isRefreshToken
        ? this.configService.get<string>('REFRESH_TOKEN_SECRET')
        : this.configService.get<string>('ACCESS_TOKEN_SECRET');

      const payload = await this.jwtService.verifyAsync<
        AccessTokenPayload | RefreshTokenPayload
      >(token, { secret });

      if (isRefreshToken && payload.type !== TOKEN_TYPE_REFRESH) {
        throw new UnauthorizedException(TOKEN_TYPE_MISMATCH);
      }

      if (!isRefreshToken && payload.type !== TOKEN_TYPE_ACCESS) {
        throw new UnauthorizedException(TOKEN_TYPE_MISMATCH);
      }

      return payload;
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
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

    const secret = isRefreshToken
      ? this.configService.get<string>('REFRESH_TOKEN_SECRET')
      : this.configService.get<string>('ACCESS_TOKEN_SECRET');

    return await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: isRefreshToken ? TOKEN_TYPE_REFRESH : TOKEN_TYPE_ACCESS,
      },
      {
        secret,
        expiresIn: isRefreshToken
          ? REFRESH_TOKEN_EXPIRES_IN
          : ACCESS_TOKEN_EXPIRES_IN,
      },
    );
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

    const userId = payload.sub;

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

    const randomPassword = generateRandomString(8); // length = 8

    await this.userService.resetUserPassword({
      userId: user.id,
      newPassword: randomPassword,
    });

    return { newPassword: randomPassword };
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
