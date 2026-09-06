import {
  BaseDomainException,
  DomainExceptionCode,
} from '../../../common/exceptions/domain.exception';

export class InvalidEmailOrPasswordException extends BaseDomainException {
  readonly code = DomainExceptionCode.BAD_REQUEST;
}

export class DevTokenBadRequestException extends BaseDomainException {
  readonly code = DomainExceptionCode.BAD_REQUEST;
}

export class DevTokenNotFoundException extends BaseDomainException {
  readonly code = DomainExceptionCode.NOT_FOUND;
}
