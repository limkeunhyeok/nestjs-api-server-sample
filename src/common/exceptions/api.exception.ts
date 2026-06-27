import { HttpStatus } from '@nestjs/common';

export class ApiException extends Error {
  constructor(
    public readonly status: HttpStatus,
    message: string,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
