import { UserEntity } from 'src/modules/users/user.entity';
import { isEmptyObject } from 'test/lib/utils';

export function expectUserResponseSucceed(
  result: Partial<UserEntity>,
  userRaw: Partial<UserEntity> = {},
) {
  expect(result).toHaveProperty('id');
  expect(result).toHaveProperty('email');
  expect(result).toHaveProperty('role');
  expect(result).toHaveProperty('latestTryLoginDate');
  expect(result).toHaveProperty('createdAt');
  expect(result).toHaveProperty('updatedAt');
  expect(result).toHaveProperty('version');

  if (!isEmptyObject(userRaw)) {
    expect(result.role).toBe(userRaw.role);
  }
}
