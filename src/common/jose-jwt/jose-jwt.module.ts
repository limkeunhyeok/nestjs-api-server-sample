import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { JOSE_JWT_MODULE_OPTIONS } from './jose-jwt.const';
import {
  JoseJwtModuleAsyncOptions,
  JoseJwtModuleOptions,
  JoseJwtOptionsFactory,
} from './jose-jwt.interface';
import { JoseJwtService } from './jose-jwt.service';

// jose 여러 기능 중,
// JWK를 사용해 JWT 생성 및 검증
// https://datatracker.ietf.org/doc/html/rfc7517
@Module({
  providers: [JoseJwtService],
  exports: [JoseJwtService],
})
export class JoseJwtModule {
  static register(options: JoseJwtModuleOptions): DynamicModule {
    return {
      module: JoseJwtModule,
      global: options.global,
      providers: [
        {
          provide: JOSE_JWT_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  static registerAsync(options: JoseJwtModuleAsyncOptions): DynamicModule {
    return {
      module: JoseJwtModule,
      global: options.global,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options)],
    };
  }

  private static createAsyncProviders(
    options: JoseJwtModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<JoseJwtOptionsFactory>;

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: JoseJwtModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: JOSE_JWT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<JoseJwtOptionsFactory>,
    ];
    return {
      provide: JOSE_JWT_MODULE_OPTIONS,
      useFactory: async (optionsFactory: JoseJwtOptionsFactory) =>
        await optionsFactory.createJoseJwtOptions(),
      inject,
    };
  }
}
