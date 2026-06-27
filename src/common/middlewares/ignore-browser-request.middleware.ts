import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class IgnoreBrowserRequestMiddleware implements NestMiddleware {
  private readonly ignoredPatterns = [
    /^\/favicon\.ico$/,
    /^\/.well-known\//,
    /^\/apple-touch-icon/,
  ];

  use(req: Request, res: Response, next: NextFunction) {
    if (this.ignoredPatterns.some((pattern) => pattern.test(req.path))) {
      // 204 No Content
      return res.status(HttpStatus.NO_CONTENT).end();
    }

    return next();
  }
}
