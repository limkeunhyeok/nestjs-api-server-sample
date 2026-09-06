import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/constants/role.const';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/entities/user.orm-entity';
import { expectResponseFailed } from 'test/expectation/common';
import { expectUserResponseSucceed } from 'test/expectation/user';
import { initE2ETest } from 'test/lib/init-e2e-test';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { createUser } from 'test/mockup/user';
import { Repository } from 'typeorm';

describe('User API Test', () => {
  let userRepository: Repository<UserEntity>;

  let adminTokenHeaders: any;
  let withHeadersIncludeAdminToken: any;

  const ctx = initE2ETest(async ({ module, req }) => {
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    adminTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.ADMIN,
    );
    withHeadersIncludeAdminToken = withHeadersBy(adminTokenHeaders);
  });

  describe('GET /users/:id', () => {
    const rootApiPath = '/users';

    it('should get user by id successfully and return 200', async () => {
      // given
      const user = await createUser(userRepository);
      const userId = user.id;

      // when
      const res = await withHeadersIncludeAdminToken(
        ctx.req.get(`${rootApiPath}/${userId}`),
      ).expect(200);

      // then
      const body = res.body;
      expectUserResponseSucceed(body);
    });

    it('should return 404 when user is not found', async () => {
      // given
      const nonExistentId = 2 ** 31 - 1;

      // when
      const res = await withHeadersIncludeAdminToken(
        ctx.req.get(`${rootApiPath}/${nonExistentId}`),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });
  });
});
