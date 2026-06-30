import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/user.orm-entity';
import { expectForgotPasswordResponseSucceed } from 'test/expectation/auth';
import { expectResponseFailed } from 'test/expectation/common';
import { initE2ETest } from 'test/lib/init-e2e-test';
import { fetchHeaders, withHeadersBy } from 'test/lib/utils';
import { extractSignInParams } from 'test/mockup/auth';
import { createUser, mockUserRaw } from 'test/mockup/user';
import { Repository } from 'typeorm';

describe('Auth API Test', () => {
  let userRepository: Repository<UserEntity>;

  let userRaw: any;
  let headers: any;
  let withHeaders: any;

  const ctx = initE2ETest(async ({ module, req }) => {
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    userRaw = await mockUserRaw();
    await createUser(userRepository, userRaw);

    headers = await fetchHeaders(req);
    withHeaders = withHeadersBy(headers);
  });

  describe('POST /auth/forgot-password', () => {
    const rootApiPath = '/auth/forgot-password';

    it('should issue a new password successfully', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);

      const params = {
        email: signInParams.email,
      };

      // when
      const res = await withHeaders(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectForgotPasswordResponseSucceed(body);
    });

    it('should return 400 when required email is missing', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);

      const params = {};

      // when
      const res = await withHeaders(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 404 when email does not exist', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);

      const params = {
        email: 'not-found@example.com',
      };

      // when
      const res = await withHeaders(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });
  });
});
