import { ModuleMetadata, Type } from '@nestjs/common';

export interface BaseEcJwk {
  kty: 'EC'; // Key Type. 원본 로직은 타원 곡선(EC)만 취급
  x: string; // 공개키 좌표 X
  y: string; // 공개키 좌표 Y
  d?: string; // 비밀키. Private Key일 때만 존재
  kid: string; // Key ID. 키 생성 시, 선택 사항이며 원본 로직에는 포함되어 있음
  use: 'sig'; // 용도. 키 생성 시, 선택 사항이며 원본 로직에는 포함되어 있음
}

// 각 알고리즘에 매핑되는 타원 곡선 정보. 원본 로직에는 ES256만 사용
// https://github.com/panva/jose/issues/210#jws-alg
export type Es256Jwk = BaseEcJwk & { alg: 'ES256'; crv: 'P-256' };
export type Es384Jwk = BaseEcJwk & { alg: 'ES384'; crv: 'P-384' };
export type Es512Jwk = BaseEcJwk & { alg: 'ES512'; crv: 'P-521' };

export type JoseEcJwk = Es256Jwk | Es384Jwk | Es512Jwk;

export interface JoseJwtModuleOptions {
  global?: boolean;
  priKey: JoseEcJwk;
  pubKey: JoseEcJwk;
}

export interface JoseJwtOptionsFactory {
  createJoseJwtOptions(): Promise<JoseJwtModuleOptions> | JoseJwtModuleOptions;
}

export interface JoseJwtModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useClass?: Type<JoseJwtOptionsFactory>;
  useExisting?: Type<JoseJwtOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<JoseJwtModuleOptions> | JoseJwtModuleOptions;
  inject?: any[];
  global?: boolean;
}
