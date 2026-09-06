import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { hashString } from 'src/libs/cache';

const TOKEN_BLACKLIST_PREFIX = 'auth:blacklist:';

@Injectable()
export class TokenBlacklistService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async blacklist(token: string, expirySeconds: number): Promise<void> {
    const key = `${TOKEN_BLACKLIST_PREFIX}${hashString(token)}`;
    const ttlMs = Math.max(expirySeconds * 1000, 1000);
    await this.cacheManager.set(key, true, ttlMs);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const key = `${TOKEN_BLACKLIST_PREFIX}${hashString(token)}`;
    const result = await this.cacheManager.get<boolean>(key);
    return result === true;
  }
}
