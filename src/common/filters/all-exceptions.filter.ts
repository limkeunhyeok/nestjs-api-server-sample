import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogCategory, logger } from 'src/libs/logger';
import { TypeORMError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let httpStatus: number;
    let message: string;
    let category: LogCategory;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      message = exception.message;
      category = LogCategory.REQUEST_FAIL;
    } else if (exception instanceof TypeORMError) {
      httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;
      message = exception.message;
      category = LogCategory.DB_FAIL;
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unhandled error occurred.';
      category = LogCategory.UNHANDLED_ERROR;
    }

    const path = request.url;

    logger.error({
      category,
      message,
      error: <Error>exception,
      path,
    });

    response.status(httpStatus).json({
      status: httpStatus,
      message,
      error: exception,
      timestamp: new Date().toISOString(),
      path,
    });
  }
}
