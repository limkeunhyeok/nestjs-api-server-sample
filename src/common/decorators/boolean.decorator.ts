import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';

export const TransformAndValidateBoolean = (): PropertyDecorator => {
  return Transform((d) => {
    const bools = [true, 'true', 'True', false, 'false', 'False'];

    if (!(d.value && bools.includes(d.value))) {
      throw new BadRequestException('Invalid boolean value.');
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
