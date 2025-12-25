import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { isNil } from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ExtendedLogger } from '../interfaces/extended-logger.interface';

export interface CacheableOptions<TArgs extends unknown[] = unknown[]> {
  keyGenerator?: (...args: TArgs) => string;
  ttl?: number | ((...args: TArgs) => number);
  trackKeys?: boolean;
  keysSetName?: string; // 서비스 내, 키셋이 여러개 일수도 있음
}

export interface CacheableInstance {
  cacheManager: Cache;
  cacheKeys?: Set<string>;
  [key: string]: unknown;
}

export function Cacheable<TArgs extends unknown[] = unknown[]>(
  options: CacheableOptions<TArgs>,
) {
  const LOG_CONTEXT = 'CacheableDecorator';

  const injectCacheManager = Inject(CACHE_MANAGER);
  const injectLogger = Inject(WINSTON_MODULE_NEST_PROVIDER);

  return function <T>(
    target: object, // 클래스 프로토타입
    propertyKey: string, // 메서드명
    descriptor: TypedPropertyDescriptor<(...args: TArgs) => Promise<T>>, // 메서드 디스크립터
  ): TypedPropertyDescriptor<(...args: TArgs) => Promise<T>> {
    const originalMethod = descriptor.value; // original은 데코레이터를 추가한 service method

    if (!originalMethod) {
      return descriptor;
    }

    injectCacheManager(target, 'cacheManager');
    injectLogger(target, 'logger');

    descriptor.value = async function (
      this: CacheableInstance,
      ...args: TArgs
    ): Promise<T> {
      const { cacheManager } = this;
      const logger = (this.logger as ExtendedLogger) ?? console;

      if (!cacheManager) {
        logger.warn({
          context: LOG_CONTEXT,
          message: `CacheManager not injected in ${target.constructor.name}. Skipping cache.`,
        });
        return originalMethod.apply(this, args);
      }

      const cacheKey =
        options.keyGenerator?.(...args) ??
        `${propertyKey}:${JSON.stringify(args)}`;

      try {
        const cached = await cacheManager.get<T>(cacheKey);
        if (!isNil(cached)) {
          logger.debug({
            context: LOG_CONTEXT,
            message: `Cache hit: ${cacheKey}`,
          });
          return cached;
        }
      } catch (error) {
        logger.error({
          context: LOG_CONTEXT,
          message: `Cache get error: ${cacheKey}`,
          error: error as Error,
        });
      }

      logger.debug({
        context: LOG_CONTEXT,
        message: `Cache miss: ${cacheKey}`,
      });

      const result = await originalMethod.apply(this, args);
      const plainResult = instanceToPlain(result);

      try {
        let ttl: number | undefined;
        if (typeof options.ttl === 'function') {
          ttl = options.ttl(...args);
        } else if (typeof options.ttl === 'number') {
          ttl = options.ttl;
        }

        await cacheManager.set(cacheKey, plainResult, ttl);
        logger.log({
          context: LOG_CONTEXT,
          message: `Cached: ${cacheKey}${ttl ? ` (TTL: ${ttl / 1000}s)` : ''}`,
        });

        if (options.trackKeys && options.keysSetName) {
          const keysSet = this[options.keysSetName];

          if (keysSet instanceof Set) {
            keysSet.add(cacheKey);
          } else {
            this[options.keysSetName] = new Set<string>([cacheKey]);
          }
        }
      } catch (error) {
        logger.error({
          context: LOG_CONTEXT,
          message: `Cache set error: ${cacheKey}`,
          error: error as Error,
        });
      }

      return plainResult as T;
    };

    return descriptor;
  };
}
