import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/user.entity';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { expectTokenResponseSucceed } from 'test/expectation/auth';
import { expectResponseFailed } from 'test/expectation/common';
import { createTestApp } from 'test/lib/create-test-app';
import { fetchHeaders, withHeadersBy } from 'test/lib/utils';
import {
  createUser,
  extractUserCreationParams,
  mockUserRaw,
} from 'test/mockup/user';
import { DataSource, Repository } from 'typeorm';

describe('Auth API Test', () => {
  let app: INestApplication;
  let module: TestingModule;
  let dataSource: DataSource;

  let userRepository: Repository<UserEntity>;

  let req: TestAgent;

  let headers: any;
  let withHeaders: any;

  beforeAll(async () => {
    const result = await createTestApp();

    app = result.app;
    module = result.module;

    dataSource = module.get(DataSource);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    await app.init();

    req = request(app.getHttpServer());

    headers = await fetchHeaders(req);
    withHeaders = withHeadersBy(headers);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    const rootApiPath = '/auth/register';

    it('should sign up successfully and return 201', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);

      // when
      const res = await withHeaders(
        req.post(`${rootApiPath}`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectTokenResponseSucceed(body);
    });

    it('should return 400 when email is missing', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);

      params.email = undefined as any;

      // when
      const res = await withHeaders(
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
      const res = await withHeaders(
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
      const res = await withHeaders(
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
      const res = await withHeaders(
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
      const res = await withHeaders(
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
      const res = await withHeaders(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });
  });
});
