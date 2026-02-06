import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  exportJWK,
  generateKeyPair,
  importJWK,
  JWTPayload,
  jwtVerify,
  SignJWT,
} from 'jose';
import { JOSE_JWT_MODULE_OPTIONS } from './jose-jwt.const';
import { Es256Jwk, JoseJwtModuleOptions } from './jose-jwt.interface';

@Injectable()
export class JoseJwtService {
  constructor(
    @Inject(JOSE_JWT_MODULE_OPTIONS)
    private readonly options: JoseJwtModuleOptions,
  ) {}

  async sign(payload: JWTPayload, expiresIn: string | number): Promise<string> {
    const privateJwk = this.options.priKey;

    const privateKey = await importJWK(privateJwk, privateJwk.alg);

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: privateJwk.alg, typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(privateKey);

    return jwt;
  }

  async verify(token: string): Promise<JWTPayload> {
    const publicJwk = this.options.pubKey;

    const publicKey = await importJWK(publicJwk, publicJwk.alg);

    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: [publicJwk.alg],
    });

    return payload;
  }

  static async generateEs256Jwk(): Promise<{
    privateJwk: Es256Jwk;
    publicJwk: Es256Jwk;
  }> {
    const alg = 'ES256';
    const { publicKey, privateKey } = await generateKeyPair(alg, {
      extractable: true,
    });

    const privateJwk = await exportJWK(privateKey);
    const publicJwk = await exportJWK(publicKey);

    const kid = crypto.randomUUID();

    privateJwk.alg = alg;
    publicJwk.alg = alg;

    privateJwk.kid = kid;
    publicJwk.kid = kid;

    privateJwk.use = 'sig';
    publicJwk.use = 'sig';

    return {
      privateJwk: privateJwk as Es256Jwk,
      publicJwk: publicJwk as Es256Jwk,
    };
  }
}
