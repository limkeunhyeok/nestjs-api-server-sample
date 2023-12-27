import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogCategory, logger } from 'src/libs/logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const category =
      exception instanceof HttpException
        ? LogCategory.REQUEST_FAIL
        : LogCategory.UNHANDLED_ERROR;

    const path = request.url;

    logger.error({
      category,
      message: exception.message,
      error: exception,
      path,
    });

    response.status(httpStatus).json({
      ...exception,
      timestamp: new Date().toISOString(),
      path,
    });
  }
}
