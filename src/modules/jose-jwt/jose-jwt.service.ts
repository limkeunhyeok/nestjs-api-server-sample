import { Inject, Injectable } from '@nestjs/common';
import {
  exportJWK,
  generateKeyPair,
  importJWK,
  JWK,
  JWTPayload,
  jwtVerify,
  SignJWT,
} from 'jose';
import { JOSE_JWT_MODULE_OPTIONS } from './jose-jwt.const';
import { JoseJwtModuleOptions } from './jose-jwt.interface';

@Injectable()
export class JoseJwtService {
  constructor(
    @Inject(JOSE_JWT_MODULE_OPTIONS)
    private readonly options: JoseJwtModuleOptions,
  ) {}

  async sign(payload: JWTPayload): Promise<string> {
    const privateJwk = this.options.priKey;

    const privateKey = await importJWK(privateJwk, privateJwk.alg);

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: privateJwk.alg, typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('1d')
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

  async generateEs256Jwk(): Promise<{
    privateJwk: JWK;
    publicJwk: JWK;
  }> {
    const { publicKey, privateKey } = await generateKeyPair('ES256', {
      extractable: true,
    });

    const privateJwk = await exportJWK(privateKey);
    const publicJwk = await exportJWK(publicKey);

    privateJwk.kid = crypto.randomUUID();
    publicJwk.kid = privateJwk.kid;

    privateJwk.use = 'sig';
    publicJwk.use = 'sig';

    return {
      privateJwk,
      publicJwk,
    };
  }
}
