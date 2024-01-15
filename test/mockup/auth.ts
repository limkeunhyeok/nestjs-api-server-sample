import { UserEntity } from 'src/modules/users/user.entity';

export function extractSignInParams(
  userRaw: Omit<UserEntity, 'id' | 'version' | 'posts'>,
) {
  return {
    email: userRaw.email,
    password: userRaw.password,
  };
}
