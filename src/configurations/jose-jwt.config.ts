import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JoseEcJwk,
  JoseJwtModuleOptions,
  JoseJwtOptionsFactory,
} from 'src/common/jose-jwt/jose-jwt.interface';
import { ServerEnv } from './server.config';

@Injectable()
export class JoseJwtConfigService implements JoseJwtOptionsFactory {
  constructor(private readonly configService: ConfigService<ServerEnv, true>) {}

  createJoseJwtOptions(): JoseJwtModuleOptions {
    const priKey = this.configService.get<JoseEcJwk>('JWT_PRIVATE_JWK');
    const pubKey = this.configService.get<JoseEcJwk>('JWT_PUBLIC_JWK');

    return {
      priKey,
      pubKey,
    };
  }
}
