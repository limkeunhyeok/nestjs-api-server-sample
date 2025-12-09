import { UnauthorizedException } from '@nestjs/common';
import { SignOptions, VerifyOptions, sign, verify } from 'jsonwebtoken';
import { Role } from 'src/common/constants/role.const';

export interface TokenPayload {
  userId: number;
  role: Role;
}

export const createToken = (
  payload: TokenPayload,
  secret: string,
  options?: SignOptions,
) => {
  return sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '1d',
    ...options,
  });
};

export const verifyToken = (
  token: string,
  secret: string,
  options?: VerifyOptions,
) => {
  try {
    const decoded = <TokenPayload>verify(token, secret, options);
    if (!decoded.userId || !decoded.role) {
      throw new UnauthorizedException('Invalid token.');
    }

    return decoded;
  } catch (error) {
    throw new UnauthorizedException(error);
  }
};
