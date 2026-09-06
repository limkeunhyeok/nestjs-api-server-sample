import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
} from 'nest-winston';
import * as winston from 'winston';
import { NodeEnv, ServerEnv } from './server.config';

const LOG_LEVELS = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  http: 4,
  verbose: 5,
  debug: 6,
  silly: 7,
};

const SENSITIVE_FIELDS = [
  'password',
  'passwordConfirm',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'authorization',
  'creditCard',
  'ssn',
  'pin',
];

@Injectable()
export class WinstonConfigService implements WinstonModuleOptionsFactory {
  constructor(private readonly configService: ConfigService<ServerEnv, true>) {}

  createWinstonModuleOptions(): WinstonModuleOptions {
    const nodeEnv = this.configService.get<NodeEnv>('NODE_ENV');

    const level = nodeEnv === NodeEnv.PROD ? 'info' : 'silly';
    const jsonFormat =
      nodeEnv === NodeEnv.PROD
        ? this.createJsonFormat()
        : winston.format.prettyPrint({ colorize: true, depth: 2 });

    return {
      levels: LOG_LEVELS,
      transports: [
        new winston.transports.Console({
          level,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            jsonFormat,
          ),
        }),
      ],
    };
  }

  private createJsonFormat(): winston.Logform.Format {
    return winston.format.printf(
      ({ timestamp, level, message, context, trace, ...metadata }) => {
        const maskedMetadata = this.maskSensitiveData(metadata);

        const log: Record<string, unknown> = {
          timestamp,
          level,
          context: context || 'Application',
          message,
          ...(maskedMetadata as Record<string, unknown>),
        };

        if (trace) {
          log.trace = trace;
        }

        return JSON.stringify(log);
      },
    );
  }

  private maskSensitiveData(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.maskSensitiveData(item));
    }

    if (typeof obj === 'object') {
      const masked: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = SENSITIVE_FIELDS.some((field) =>
          lowerKey.includes(field.toLowerCase()),
        );

        if (isSensitive && value) {
          masked[key] = '****';
        } else if (typeof value === 'object') {
          masked[key] = this.maskSensitiveData(value);
        } else {
          masked[key] = value;
        }
      }
      return masked;
    }

    return obj;
  }
}
