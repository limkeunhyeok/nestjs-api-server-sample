import { HttpStatus } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { ApiException } from '../exceptions/api.exception';

export const TransformAndValidateBoolean = (): PropertyDecorator => {
  return Transform((d) => {
    const bools = [true, 'true', 'True', false, 'false', 'False'];

    if (!(d.value && bools.includes(d.value))) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'Invalid boolean value.');
    }

    return (
      d.value === 'true' ||
      d.value === 'True' ||
      d.value === true ||
      d.value === 'false' ||
      d.value === 'False' ||
      d.value === false
    );
  });
};
