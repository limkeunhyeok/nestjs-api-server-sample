import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { isBefore } from 'date-fns';

export const comparedStartAndEnd = (startDate: any, endDate: any) => {
  if (startDate instanceof Date && endDate instanceof Date) {
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

    const [relatedPropertyName] = args.constraints as [string];
    const obj = args.object as Record<string, unknown>;

    const relatedValue = obj[relatedPropertyName];

    return comparedStartAndEnd(value, relatedValue);
  }

  defaultMessage(args?: ValidationArguments): string {
    if (!args) {
      return 'require arguments.';
    }

    const [relatedPropertyName] = args.constraints as [string];
    const property = args.property;
    const value = args.value as unknown;
    const obj = args.object as Record<string, unknown>;
    const relatedValue = obj[relatedPropertyName];

    if (!(value instanceof Date) || !(relatedValue instanceof Date)) {
      return `${property} and ${relatedPropertyName} must be valid Date objects.`;
    }

    return `${property} (${value.toISOString()}) must be earlier than ${relatedPropertyName} (${relatedValue.toISOString()}).`;
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
