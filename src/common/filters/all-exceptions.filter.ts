import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { isEmpty } from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ExtendedLogger } from '../interfaces/extended-logger.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: ExtendedLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    response.locals.hasError = true; // logging middleware에서 response 로그를 출력하지 않도록

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

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception && typeof exception === 'object' && 'message' in exception
        ? (exception as Error).message
        : 'Unhandled error occurred.';

    const exceptionCode =
      exception instanceof HttpException
        ? exception.name
        : InternalServerErrorException.name;

    const stack =
      exception && typeof exception === 'object' && 'stack' in exception
        ? String((exception as Error).stack)
        : undefined;

    this.logger.error({
      context: this.constructor.name,
      message,
      ...logContents,
      status,
      stack,
      error: {
        message,
        name: exceptionCode,
        status,
      },
    });

    return response.status(status).json({
      status,
      code: exceptionCode,
      message,
      ...(stack && { stack }),
    });
  }
}
