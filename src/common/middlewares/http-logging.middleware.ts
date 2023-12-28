import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LogCategory, logger } from 'src/libs/logger';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { path, method, query, ip, body } = req;

    logger.http({
      message: `Received request from '${ip}': method=${method}, path=${path}, query=${JSON.stringify(
        query,
      )}, body: ${JSON.stringify(body)}`,
      category: LogCategory.HTTP_REQUEST,
    });

    next();
  }
}
