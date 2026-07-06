/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodIssue } from 'zod';

@Injectable()
export class DtoValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    // metatype이 없거나 객체/함수가 아니면 바로 패스
    if (
      !metatype ||
      (typeof metatype !== 'function' && typeof metatype !== 'object')
    ) {
      return value;
    }

    // static schema가 없거나 zod 스키마가 아니면 패스
    if (
      !('schema' in metatype) ||
      typeof (metatype as any).schema?.safeParse !== 'function'
    ) {
      return value;
    }

    const schema = (metatype as any).schema;
    const result = schema.safeParse(value);

    if (!result.success) {
      // Zod 에러 메시지를 기존 포맷과 호환되게 '; ' 로 합침
      const messages: string = result.error.issues
        .map((e: ZodIssue) => {
          const field = e.path.join('.');
          return field ? `${field}: ${e.message}` : e.message;
        })
        .join('; ');

      throw new BadRequestException(messages);
    }

    // Zod 검증을 마친 가공된 데이터를 반환
    return result.data;
  }
}
