import {
  BaseDomainException,
  DomainExceptionCode,
} from '../../../../common/exceptions/domain.exception';

export class EmailAlreadyRegisteredException extends BaseDomainException {
  readonly code = DomainExceptionCode.BAD_REQUEST;
}

export class UserNotFoundException extends BaseDomainException {
  readonly code = DomainExceptionCode.NOT_FOUND;
}

export class UserForbiddenException extends BaseDomainException {
  readonly code = DomainExceptionCode.FORBIDDEN;
}
