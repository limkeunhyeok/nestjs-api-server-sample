import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/entities/user.orm-entity';
import { expectTokenResponseSucceed } from 'test/expectation/auth';
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

  describe('POST /auth/login', () => {
    const rootApiPath = '/auth/login';

    it('should login successfully and return 201', async () => {
      // given
      const params = extractSignInParams(userRaw);

      // when
      const res = await withHeaders(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectTokenResponseSucceed(body);
    });

    it('should return 400 when required login params are missing', async () => {
      // given
      const params = extractSignInParams(userRaw);

      // when
      const res = await withHeaders(ctx.req.post(`${rootApiPath}`)).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when email is incorrect', async () => {
      // given
      const params = extractSignInParams(userRaw);
      params.email = 'incorrect@email.com';

      // when
      const res = await withHeaders(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when password is incorrect', async () => {
      // given
      const params = extractSignInParams(userRaw);
      params.password = 'incorrect';

      // when
      const res = await withHeaders(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });
  });
});
