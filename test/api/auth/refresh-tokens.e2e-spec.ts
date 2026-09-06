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

  describe('POST /auth/refresh', () => {
    const rootApiPath = '/auth/refresh';

    it('should refresh access and refresh tokens successfully and return 201', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);
      const signInRes = await withHeaders(
        ctx.req.post('/auth/login').send(signInParams),
      ).expect(201);

      const { refreshToken } = signInRes.body;

      const params = {
        refreshToken,
      };

      // when
      const res = await withHeaders(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectTokenResponseSucceed(body);
    });

    it('should return 401 when refresh token is invalid or malformed', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);
      const signInRes = await withHeaders(
        ctx.req.post('/auth/login').send(signInParams),
      ).expect(201);

      const params = {
        refreshToken: 'refreshToken',
      };

      // when
      const res = await withHeaders(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(401);

      // then
      expectResponseFailed(res);
    });

    it('should return 401 when token type is not refresh', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);
      const signInRes = await withHeaders(
        ctx.req.post('/auth/login').send(signInParams),
      ).expect(201);

      const { accessToken } = signInRes.body;

      const params = {
        refreshToken: accessToken,
      };

      // when
      const res = await withHeaders(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(401);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when refresh token is missing', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);
      const signInRes = await withHeaders(
        ctx.req.post('/auth/login').send(signInParams),
      ).expect(201);

      const params = {};

      // when
      const res = await withHeaders(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });
  });
});
