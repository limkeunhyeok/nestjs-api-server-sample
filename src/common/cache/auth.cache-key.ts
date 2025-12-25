import { hashString } from 'src/libs/cache';

export const buildAuthAccessTokenCacheKey = (token: string) =>
  `auth:access-token:${hashString(token)}`;
