import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ExtendedLogger } from '../interfaces/extended-logger.interface';
import { CacheableInstance } from './cacheable.decorator';

export interface CacheEvictOptions<TArgs extends unknown[] = unknown[]> {
  keyGenerator?: (...args: TArgs) => string;
  keysSetName?: string;
}

export function CacheEvict<TArgs extends unknown[] = unknown[]>(
  options: CacheEvictOptions<TArgs>,
) {
  const LOG_CONTEXT = 'CacheEvictDecorator';

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

      const result = await originalMethod.apply(this, args);

      if (!cacheManager) {
        logger.warn({
          context: LOG_CONTEXT,
          message: `CacheManager not injected in ${target.constructor.name}. Skipping cache eviction.`,
        });
        return result;
      }

      try {
        // 특정 키 무효화
        if (options.keyGenerator) {
          const cacheKey = options.keyGenerator(...args);
          await cacheManager.del(cacheKey);
          logger.debug({
            context: LOG_CONTEXT,
            message: `Cache evicted: ${cacheKey}`,
          });
        }

        // 키셋의 모든 키 무효화
        if (options.keysSetName) {
          const keysSet = this[options.keysSetName];
          if (keysSet instanceof Set) {
            logger.debug({
              context: LOG_CONTEXT,
              message: `Evicting ${keysSet.size} cache entries...`,
            });

            await Promise.all(
              Array.from(keysSet).map((key) => {
                if (typeof key === 'string') {
                  return cacheManager.del(key);
                }
                return Promise.resolve();
              }),
            );

            keysSet.clear();
          }
        }
      } catch (error) {
        logger.error({
          context: LOG_CONTEXT,
          message: 'Cache eviction error:',
          error: error as Error,
        });
      }

      return result;
    };

    return descriptor;
  };
}
