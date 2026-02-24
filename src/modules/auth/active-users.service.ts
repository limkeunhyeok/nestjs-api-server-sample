import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

const ACTIVE_USERS_KEY = 'auth:active-users';
const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

@Injectable()
export class ActiveUsersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async trackUser(userId: string | number): Promise<void> {
    const key = `${ACTIVE_USERS_KEY}:${userId}`;
    await this.cacheManager.set(key, Date.now(), ACTIVE_WINDOW_MS);
  }

  async getActiveUserCount(): Promise<number> {
    const userIds = await this.getActiveUserIds();
    return userIds.length;
  }

  async getActiveUserIds(): Promise<string[]> {
    const store = (this.cacheManager as any).store ?? (this.cacheManager as any).stores?.[0];

    if (typeof store.keys === 'function') {
      const keys: string[] = await store.keys(`${ACTIVE_USERS_KEY}:*`);
      return keys.map((key) => key.replace(`${ACTIVE_USERS_KEY}:`, ''));
    }

    const countKey = `${ACTIVE_USERS_KEY}:__index__`;
    const index = await this.cacheManager.get<string[]>(countKey);
    return index ?? [];
  }
}
