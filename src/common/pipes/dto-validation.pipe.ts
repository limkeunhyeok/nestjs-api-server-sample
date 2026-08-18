/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodIssue } from 'zod';
import { ApiException } from '../exceptions/api.exception';

@Injectable()
export class DtoValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (
      !metatype ||
      (typeof metatype !== 'function' && typeof metatype !== 'object')
    ) {
      return value;
    }

    if (
      !('schema' in metatype) ||
      typeof (metatype as any).schema?.safeParse !== 'function'
    ) {
      return value;
    }

    const schema = (metatype as any).schema;
    const result = schema.safeParse(value);

    if (!result.success) {
      const messages: string = result.error.issues
        .map((e: ZodIssue) => {
          const field = e.path.join('.');
          return field ? `${field}: ${e.message}` : e.message;
        })
        .join('; ');

      throw new ApiException(HttpStatus.BAD_REQUEST, messages);
    }

    return result.data;
  }
}
