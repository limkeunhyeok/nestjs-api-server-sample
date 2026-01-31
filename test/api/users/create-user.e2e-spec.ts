import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/constants/role.const';
import { UserEntity } from 'src/modules/users/user.entity';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { expectResponseFailed } from 'test/expectation/common';
import { expectUserResponseSucceed } from 'test/expectation/user';
import { createTestApp } from 'test/lib/create-test-app';
import { TestService } from 'test/lib/test.service';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import {
  createUser,
  extractUserCreationParams,
  mockUserRaw,
} from 'test/mockup/user';
import { Repository } from 'typeorm';

const globalAny: any = global;

describe('User API Test', () => {
  let app: INestApplication;
  let module: TestingModule;

  let userRepository: Repository<UserEntity>;

  let req: TestAgent;

  let adminTokenHeaders: any;
  let withHeadersIncludeAdminToken: any;

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

    adminTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.ADMIN,
    );
    withHeadersIncludeAdminToken = withHeadersBy(adminTokenHeaders);
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

  describe('POST /users', () => {
    const rootApiPath = '/users';

    it('should create user successfully and return 201', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectUserResponseSucceed(body);
    });

    it('should return 400 when email is missing', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);

      params.email = undefined as any;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when password is missing', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);

      params.password = undefined as any;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when name is missing', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);

      params.name = undefined as any;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when email is invalid', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);

      params.email = 'example';

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when password is invalid', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);

      params.password = 'example';

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when role is invalid', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);

      params.role = 'role' as Role;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when email is duplicated', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);

      await createUser(userRepository, userRaw);

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });
  });
});
