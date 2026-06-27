import {
  BaseDomainException,
  DomainExceptionCode,
} from '../../../common/exceptions/domain.exception';

export class PostNotFoundException extends BaseDomainException {
  readonly code = DomainExceptionCode.NOT_FOUND;
}

export class PostForbiddenException extends BaseDomainException {
  readonly code = DomainExceptionCode.FORBIDDEN;
}
