import * as winston from 'winston';

export const LogCategory = {
  INITIALIZE: 'initialize',
  VALIDATION: 'validation',
  REQUEST_FAIL: 'requestFail',
  UNHANDLED_ERROR: 'unhandledError',
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
  path?: string;
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

  error(logParams: LogParams) {
    this.logger.error({ ...logParams });
  }

  warn(logParams: LogParams) {
    this.logger.warn({ ...logParams });
  }

  info(logParams: LogParams) {
    this.logger.info({ ...logParams });
  }

  http(logParams: LogParams) {
    this.logger.http({ ...logParams });
  }

  verbose(logParams: LogParams) {
    this.logger.verbose({ ...logParams });
  }

  debug(logParams: LogParams) {
    this.logger.debug({ ...logParams });
  }

  silly(logParams: LogParams) {
    this.logger.silly({ ...logParams });
  }
}

export const logger = new CustomLogger();
