import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { addDays, subDays } from 'date-fns';
import { Role } from 'src/common/constants/role.const';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { UserEntity } from 'src/modules/users/user.entity';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import {
  expectPagingResponseSucceed,
  expectResponseFailed,
} from 'test/expectation/common';
import { expectUserResponseSucceed } from 'test/expectation/user';
import { createTestApp } from 'test/lib/create-test-app';
import { TestService } from 'test/lib/test.service';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { createUser } from 'test/mockup/user';
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

  describe('GET /users', () => {
    const rootApiPath = '/users';

    it('should get user successfully and return 200', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        role: Role.MEMBER,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(200);

      // then
      expectPagingResponseSucceed(res);

      const body = res.body;
      for (const user of body.data) {
        expectUserResponseSucceed(user);
      }
    });

    it('should return 400 when date is invalid', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: addDays(new Date(), 1),
        endDate: subDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        role: Role.MEMBER,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when role is invalid', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        role: 'role',
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when limit is invalid', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: -1,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        role: Role.MEMBER,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when offset is invalid', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: -1,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        role: Role.MEMBER,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when sorting direction is invalid', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: 'direction',
        role: Role.MEMBER,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when sorting field is invalid', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'field',
        sortDirection: SortDirection.DESC,
        role: Role.MEMBER,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });
  });
});
