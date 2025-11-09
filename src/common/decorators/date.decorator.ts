import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { isBefore } from 'date-fns';

export const comparedStartAndEnd = (startDate: Date, endDate: Date) => {
  if (startDate && endDate) {
    return isBefore(startDate, endDate);
  }
  return false;
};

@ValidatorConstraint({ name: 'IsBeforeDate' })
export class IsBeforeDateConstraint implements ValidatorConstraintInterface {
  validate(
    value: Date,
    args?: ValidationArguments,
  ): boolean | Promise<boolean> {
    if (!args) return false;

    const obj = args.object as Record<string, any>;
    const [relatedPropertyName] = args.constraints;
    const relatedValue = obj[relatedPropertyName];

    return comparedStartAndEnd(value, relatedValue);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Date can not before.';
  }
}

export function IsBeforeDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsBeforeDateConstraint,
    });
  };
}
