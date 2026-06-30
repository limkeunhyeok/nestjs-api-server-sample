import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/user.orm-entity';
import { expectUserResponseSucceed } from 'test/expectation/user';
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

    userRaw = mockUserRaw();
    await createUser(userRepository, userRaw);

    headers = await fetchHeaders(req);
    withHeaders = withHeadersBy(headers);
  });

  describe('POST /auth/me', () => {
    const rootApiPath = '/auth/me';

    it('should return authenticated user information', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);
      const signInRes = await withHeaders(
        ctx.req.post('/auth/login').send(signInParams),
      ).expect(201);

      const { accessToken } = signInRes.body;
      withHeaders = withHeadersBy({ token: accessToken });

      // when
      const res = await withHeaders(ctx.req.get(`${rootApiPath}`)).expect(200);

      // then
      const body = res.body;
      expectUserResponseSucceed(body);
    });
  });
});
