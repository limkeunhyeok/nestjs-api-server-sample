import * as winston from 'winston';

export const LogCategory = {
  INITIALIZE: 'initialize',
  VALIDATION: 'validation',
  HTTP_REQUEST: 'httpRequest',
  HTTP_RESPONSE: 'httpResponse',
  HTTP_EXCEPTION: 'httpException',
  DB_READ: 'dbRead',
  DB_WRITE: 'deWrite',
  DB_FAIL: 'dbFail',
  PERMISSION: 'permission',
} as const;

export type LogCategory = (typeof LogCategory)[keyof typeof LogCategory];

export interface LogParams {
  category: string;
  message: string;
  error?: Error;
}

const logLevel = process.env.NODE_ENV === 'prod' ? 'info' : 'silly';

export class CustomLogger {
  logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.prettyPrint(),
          ),
          level: logLevel,
        }),
      ],
    });
  }

  getLogger() {
    return this.logger;
  }

  error({ category, message, error }: LogParams) {
    this.logger.error({ category, message, error });
  }

  warn({ category, message }: LogParams) {
    this.logger.warn({ category, message, error: null });
  }

  info({ category, message }: LogParams) {
    this.logger.info({ category, message, error: null });
  }

  http({ category, message }: LogParams) {
    this.logger.http({ category, message, error: null });
  }

  verbose({ category, message }: LogParams) {
    this.logger.verbose({ category, message, error: null });
  }

  debug({ category, message }: LogParams) {
    this.logger.debug({ category, message, error: null });
  }

  silly({ category, message }: LogParams) {
    this.logger.silly({ category, message, error: null });
  }
}

export const logger = new CustomLogger();
