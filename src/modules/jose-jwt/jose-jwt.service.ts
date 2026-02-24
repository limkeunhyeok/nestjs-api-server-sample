import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  createLocalJWKSet,
  exportJWK,
  FlattenedJWSInput,
  generateKeyPair,
  importJWK,
  JWSHeaderParameters,
  JWTPayload,
  jwtVerify,
  SignJWT
} from 'jose';
import { JOSE_JWT_MODULE_OPTIONS } from './jose-jwt.const';
import { Es256Jwk, JoseJwtModuleOptions } from './jose-jwt.interface';

@Injectable()
export class JoseJwtService implements OnModuleInit {
  private privateKey: CryptoKey | Uint8Array;
  private localJWKSet: (
    protectedHeader?: JWSHeaderParameters,
    token?: FlattenedJWSInput,
  ) => Promise<CryptoKey | Uint8Array>;
  private publicJwk: Record<string, unknown>;

  constructor(
    @Inject(JOSE_JWT_MODULE_OPTIONS)
    private readonly options: JoseJwtModuleOptions,
  ) {}

  async onModuleInit(): Promise<void> {
    this.privateKey = (await importJWK(
      this.options.priKey,
      this.options.priKey.alg,
    )) as CryptoKey;

    const publicKey = (await importJWK(
      this.options.pubKey,
      this.options.pubKey.alg,
    )) as CryptoKey;
    const exported = await exportJWK(publicKey);

    this.publicJwk = {
      ...exported,
      kid: this.options.pubKey.kid,
      alg: this.options.pubKey.alg,
      use: this.options.pubKey.use,
      kty: this.options.pubKey.kty,
    };

    this.localJWKSet = createLocalJWKSet({
      keys: [this.publicJwk as JsonWebKey],
    });
  }

  getPublicJwk(): Record<string, unknown> {
    return this.publicJwk;
  }

  getPublicJwks(): { keys: Record<string, unknown>[] } {
    return { keys: [this.publicJwk] };
  }

  async sign(payload: JWTPayload, expiresIn: string | number): Promise<string> {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({
        alg: this.options.priKey.alg,
        kid: this.options.priKey.kid,
        typ: 'JWT',
      })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(this.privateKey);

    return jwt;
  }

  async verify(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, this.localJWKSet, {
      algorithms: [this.options.pubKey.alg],
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
