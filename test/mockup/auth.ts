import { UserEntity } from 'src/modules/users/infrastructure/persistence/user.orm-entity';

export function extractSignInParams(
  userRaw: Omit<UserEntity, 'id' | 'version' | 'posts' | 'comments'>,
) {
  return {
    email: userRaw.email,
    password: userRaw.password,
  };
}
