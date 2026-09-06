import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { isEmpty } from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ExtendedLogger } from '../interfaces/extended-logger.interface';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: ExtendedLogger,
  ) {}

  use(request: Request, response: Response, next: NextFunction) {
    const { originalUrl, method, query, ip, body } = request as Request<
      Record<string, unknown>,
      any,
      Record<string, unknown>,
      Record<string, unknown>
    >;

    const logContents = {
      path: originalUrl,
      method: method,
      ip: ip,
      userAgent: request.get('user-agent') || '',
      requestBody: isEmpty(body) ? {} : body,
      requestQuery: isEmpty(query) ? {} : query,
    };

    this.logger.log({
      context: this.constructor.name,
      message: 'A request has arrived.',
      ...logContents,
    });

    response.on('finish', () => {
      if (response.locals.hasError) {
        return; // 에러 로그는 filter에서 출력
      }

      const { statusCode } = response;

      this.logger.log({
        context: this.constructor.name,
        satus: statusCode,
        message: 'Send a response.',
        ...logContents,
      });
    });

    next();
  }
}
