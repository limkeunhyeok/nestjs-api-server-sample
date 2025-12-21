import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/user.entity';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { expectForgotPasswordResponseSucceed } from 'test/expectation/auth';
import { expectResponseFailed } from 'test/expectation/common';
import { createTestApp } from 'test/lib/create-test-app';
import { fetchHeaders, withHeadersBy } from 'test/lib/utils';
import { extractSignInParams } from 'test/mockup/auth';
import { createUser, mockUserRaw } from 'test/mockup/user';
import { Repository } from 'typeorm';

describe('Auth API Test', () => {
  let app: INestApplication;
  let module: TestingModule;

  let userRepository: Repository<UserEntity>;

  let req: TestAgent;

  let userRaw: any;
  let headers: any;
  let withHeaders: any;

  beforeAll(async () => {
    const result = await createTestApp();

    app = result.app;
    module = result.module;

    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    await app.init();

    req = request(app.getHttpServer());

    userRaw = await mockUserRaw();
    await createUser(userRepository, userRaw);

    headers = await fetchHeaders(req);
    withHeaders = withHeadersBy(headers);
  });

  afterAll(async () => {
    await app.close();
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
        req.post(`${rootApiPath}`).send(params),
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
        req.post(`${rootApiPath}`).send(params),
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
        req.post(`${rootApiPath}`).send(params),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });
  });
});
