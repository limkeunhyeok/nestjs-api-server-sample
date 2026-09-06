import KeyvRedis from '@keyv/redis';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerEnv } from './server.config';

@Injectable()
export class RedisConfigService implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService<ServerEnv, true>) {}

  createCacheOptions(): Promise<CacheModuleOptions> | CacheModuleOptions {
    const port = this.configService.get<number>('REDIS_PORT');
    const host = this.configService.get<string>('REDIS_HOST');
    const password = this.configService.get<string>('REDIS_PASSWORD');

    return {
      stores: [new KeyvRedis(`redis://:${password}@${host}:${port}`)],
    };
  }
}
