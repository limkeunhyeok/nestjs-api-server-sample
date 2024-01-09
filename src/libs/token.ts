import { UnauthorizedException } from '@nestjs/common';
import {
  JwtPayload,
  SignOptions,
  VerifyOptions,
  sign,
  verify,
} from 'jsonwebtoken';
import { Role } from 'src/modules/users/user.entity';

export interface TokenPayload extends JwtPayload {
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
    return decoded;
  } catch (error) {
    throw new UnauthorizedException(error);
  }
};
