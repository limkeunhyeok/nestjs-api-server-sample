import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  ConnectionNotFoundError,
  OptimisticLockVersionMismatchError,
  PessimisticLockTransactionRequiredError,
  QueryFailedError,
  TransactionAlreadyStartedError,
  TransactionNotStartedError,
  TypeORMError,
} from 'typeorm';
import { ExtendedLogger } from '../interfaces/extended-logger.interface';

@Catch(
  ConnectionNotFoundError, // DB 연결
  QueryFailedError, // 쿼리 실패
  TransactionNotStartedError, // 트랜잭션
  TransactionAlreadyStartedError, // 트랜잭션
  OptimisticLockVersionMismatchError, // 낙관적 락 충돌
  PessimisticLockTransactionRequiredError, // 비관적 락 충돌
)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: ExtendedLogger,
  ) {}

  catch(exception: TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    this.logger.fatal({
      context: this.constructor.name,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: exception.name,
      message: exception.message,
    });

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: exception.name,
      message: exception.message,
    });
  }
}