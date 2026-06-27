import {
  BaseDomainException,
  DomainExceptionCode,
} from '../../../common/exceptions/domain.exception';

export class CommentNotFoundException extends BaseDomainException {
  readonly code = DomainExceptionCode.NOT_FOUND;
}

export class CommentForbiddenException extends BaseDomainException {
  readonly code = DomainExceptionCode.FORBIDDEN;
}

export class CommentConflictException extends BaseDomainException {
  readonly code = DomainExceptionCode.CONFLICT;
}
