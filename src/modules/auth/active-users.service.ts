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

    const indexKey = `${ACTIVE_USERS_KEY}:__index__`;
    const index = await this.cacheManager.get<string[]>(indexKey) || [];
    const idStr = userId.toString();
    if (!index.includes(idStr)) {
      index.push(idStr);
      await this.cacheManager.set(indexKey, index); // No expiry or very long expiry
    }
  }

  async getActiveUserCount(): Promise<number> {
    const userIds = await this.getActiveUserIds();
    return userIds.length;
  }

  async getActiveUserIds(): Promise<string[]> {
    const indexKey = `${ACTIVE_USERS_KEY}:__index__`;
    const index = await this.cacheManager.get<string[]>(indexKey) || [];

    const activeIds: string[] = [];
    for (const userId of index) {
      const active = await this.cacheManager.get(`${ACTIVE_USERS_KEY}:${userId}`);
      if (active) {
        activeIds.push(userId);
      }
    }

    // Prune the index if some expired
    if (activeIds.length !== index.length) {
      await this.cacheManager.set(indexKey, activeIds);
    }

    return activeIds;
  }
}
