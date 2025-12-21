import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsSortableField', async: false })
export class IsSortableFieldConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    if (!args) return false;

    const [validColumns] = args.constraints as [string[]];
    return validColumns.includes(value);
  }

  defaultMessage(args?: ValidationArguments) {
    if (!args) {
      return 'require arguments.';
    }
    const [validColumns] = args.constraints as [string[]];
    return `sortField must be one of: ${validColumns.join(', ')}`;
  }
}

// @IsSortableField(['id', 'name', 'createdAt', ...])
// Typeorm에서 제공하는 함수를 통해 필드를 자동으로 지정이 가능할 것으로 추측되나,
// dto가 infra 코드를 참조해야 하고,
// password 같은 지정하면 안되는 부분들 때문에,
// dto 파일에서 sort field를 직접 선언하는 방식
export function IsSortableField(
  property: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsSortableFieldConstraint,
    });
  };
}
