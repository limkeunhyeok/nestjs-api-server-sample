import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/user.entity';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { expectUserResponseSucceed } from 'test/expectation/user';
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

    userRaw = mockUserRaw();
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

  describe('POST /auth/me', () => {
    const rootApiPath = '/auth/me';

    it('should return authenticated user information', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);
      const signInRes = await withHeaders(
        req.post('/auth/login').send(signInParams),
      ).expect(201);

      const { accessToken } = signInRes.body;
      withHeaders = withHeadersBy({ token: accessToken });

      // when
      const res = await withHeaders(req.get(`${rootApiPath}`)).expect(200);

      // then
      const body = res.body;
      expectUserResponseSucceed(body);
    });
  });
});
