import { Role } from 'src/common/constants/role.const';
import { TOKEN_TYPE_ACCESS, TOKEN_TYPE_REFRESH } from './auth.const';

export interface AccessTokenPayload {
  sub: number; // userId
  role: Role;
  type: typeof TOKEN_TYPE_ACCESS;
  iat: number; // issuedAt
  exp: number; // expiration
}

export interface RefreshTokenPayload {
  sub: number; // userId
  type: typeof TOKEN_TYPE_REFRESH;
  iat: number; // issuedAt
  exp: number; // expiration
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
