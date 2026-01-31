import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/user.entity';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { expectTokenResponseSucceed } from 'test/expectation/auth';
import { expectResponseFailed } from 'test/expectation/common';
import { createTestApp } from 'test/lib/create-test-app';
import { TestService } from 'test/lib/test.service';
import { fetchHeaders, withHeadersBy } from 'test/lib/utils';
import { extractSignInParams } from 'test/mockup/auth';
import { createUser, mockUserRaw } from 'test/mockup/user';
import { Repository } from 'typeorm';

const globalAny: any = global;

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
    globalAny.testApp = app;

    req = request(app.getHttpServer());

    userRaw = await mockUserRaw();
    await createUser(userRepository, userRaw);

    headers = await fetchHeaders(req);
    withHeaders = withHeadersBy(headers);
  });

  afterAll(async () => {
    const testService = globalAny.testApp.get(TestService);
    await testService.cleanDatabase();

    console.log('Closing NestJS application...');
    if (globalAny.testApp) {
      await globalAny.testApp.close();
      delete globalAny.testApp;
    }
    console.log('NestJS application closed.');
  });

  describe('POST /auth/login', () => {
    const rootApiPath = '/auth/login';

    it('should login successfully and return 201', async () => {
      // given
      const params = extractSignInParams(userRaw);

      // when
      const res = await withHeaders(
        req.post(`${rootApiPath}`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectTokenResponseSucceed(body);
    });

    it('should return 400 when required login params are missing', async () => {
      // given
      const params = extractSignInParams(userRaw);

      // when
      const res = await withHeaders(req.post(`${rootApiPath}`)).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when email is incorrect', async () => {
      // given
      const params = extractSignInParams(userRaw);
      params.email = 'incorrect@email.com';

      // when
      const res = await withHeaders(
        req.post(`${rootApiPath}`).send(params),
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
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });
  });
});
