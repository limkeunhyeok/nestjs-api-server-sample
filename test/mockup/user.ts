import * as bcrypt from 'bcrypt';
import * as faker from 'faker';
import { Role } from 'src/common/constants/role.const';
import { UserEntity } from 'src/modules/users/user.entity';
import { Repository } from 'typeorm';

export function mockUserRaw(role: Role = Role.MEMBER) {
  const now = new Date();

  return {
    email: faker.internet.email(),
    password: faker.internet.password(8),
    name: faker.internet.userName(),
    role,
    latestTryLoginDate: now,
    createdAt: now,
    updatedAt: now,
  };
}

export function extractUserCreationParams(
  userRaw: Omit<UserEntity, 'id' | 'version' | 'posts' | 'comments'>,
) {
  return {
    email: userRaw.email,
    password: userRaw.password,
    name: userRaw.name,
  };
}

export async function createUser(
  repository: Repository<UserEntity>,
  userRaw = mockUserRaw(),
): Promise<UserEntity> {
  const data = JSON.parse(JSON.stringify(userRaw));
  data.password = bcrypt.hashSync(data.password, 10);
  return await repository.save(data);
}
