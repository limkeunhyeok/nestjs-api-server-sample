import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/constants/role.const';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/entities/user.orm-entity';
import { expectResponseFailed } from 'test/expectation/common';
import { expectUserResponseSucceed } from 'test/expectation/user';
import { initE2ETest } from 'test/lib/init-e2e-test';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { createUser, mockUserRaw } from 'test/mockup/user';
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

  describe('PUT /users/:id', () => {
    const rootApiPath = '/users';

    it('should update user successfully and return 200', async () => {
      // given
      const user = await createUser(userRepository, mockUserRaw(Role.ADMIN));
      const userId = user.id;

      const userRaw = mockUserRaw();
      const params = {
        password: userRaw.password,
        name: userRaw.name,
        role: userRaw.role,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        ctx.req.put(`${rootApiPath}/${userId}`).send(params),
      ).expect(200);

      // then
      const body = res.body;
      expectUserResponseSucceed(body, userRaw);
    });

    it('should return 400 when password is invalid', async () => {
      // given
      const user = await createUser(userRepository);
      const userId = user.id;

      const userRaw = mockUserRaw();
      const params = {
        password: 'example',
        name: userRaw.name,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        ctx.req.put(`${rootApiPath}/${userId}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 404 when user is not found', async () => {
      // given
      const user = await createUser(userRepository);
      const nonExistentId = 2 ** 31 - 1;

      const userRaw = mockUserRaw();

      const params = {
        password: userRaw.password,
        name: userRaw.name,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        ctx.req.put(`${rootApiPath}/${nonExistentId}`).send(params),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });
  });
});
