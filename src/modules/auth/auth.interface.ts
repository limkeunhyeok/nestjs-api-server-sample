import { JWTPayload } from 'jose';
import { Role } from 'src/common/constants/role.const';
import { TOKEN_TYPE_ACCESS, TOKEN_TYPE_REFRESH } from './auth.const';

export interface AccessTokenPayload extends JWTPayload {
  sub: string; // userId
  role: Role;
  type: typeof TOKEN_TYPE_ACCESS;
  iat: number; // issuedAt
  exp: number; // expiration
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string; // userId
  type: typeof TOKEN_TYPE_REFRESH;
  iat: number; // issuedAt
  exp: number; // expiration
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser extends Omit<AccessTokenPayload, 'sub'> {
  sub: number;
  role: Role;
}
