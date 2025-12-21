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
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { createUser } from 'test/mockup/user';
import { Repository } from 'typeorm';

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

    req = request(app.getHttpServer());

    adminTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.ADMIN,
    );
    withHeadersIncludeAdminToken = withHeadersBy(adminTokenHeaders);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/:id', () => {
    const rootApiPath = '/users';

    it('should get user by id successfully and return 200', async () => {
      // given
      const user = await createUser(userRepository);
      const userId = user.id;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}/${userId}`),
      ).expect(200);

      // then
      const body = res.body;
      expectUserResponseSucceed(body);
    });

    it('should return 404 when user is not found', async () => {
      // given
      const nonExistentId = 2 ** 31 - 1;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}/${nonExistentId}`),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });
  });
});
