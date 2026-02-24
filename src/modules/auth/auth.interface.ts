import { JWTPayload } from 'jose';
import { Role } from 'src/common/constants/role.const';
import { TOKEN_TYPE_ACCESS, TOKEN_TYPE_DEV, TOKEN_TYPE_REFRESH } from './auth.const';

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  role: Role;
  type: typeof TOKEN_TYPE_ACCESS;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;
  type: typeof TOKEN_TYPE_REFRESH;
  iat: number;
  exp: number;
}

export interface DevTokenPayload extends JWTPayload {
  sub: string;
  role: Role;
  type: typeof TOKEN_TYPE_DEV;
  jti: string;
  devTokenName: string;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser extends Omit<AccessTokenPayload, 'sub'> {
  sub: number;
  role: Role;
}

