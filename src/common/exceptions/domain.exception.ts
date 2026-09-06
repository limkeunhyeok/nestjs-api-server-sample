export enum DomainExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL = 'INTERNAL',
}

export abstract class BaseDomainException extends Error {
  abstract readonly code: DomainExceptionCode;

  constructor(
    message: string,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
