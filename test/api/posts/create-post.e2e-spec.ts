import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/constants/role.const';
import { UserEntity } from 'src/modules/users/user.entity';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { expectResponseFailed } from 'test/expectation/common';
import { expectPostResponseSucceed } from 'test/expectation/post';
import { createTestApp } from 'test/lib/create-test-app';
import { TestService } from 'test/lib/test.service';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { mockCreatePostDto } from 'test/mockup/post';
import { Repository } from 'typeorm';

const globalAny: any = global;

describe('Post API Test', () => {
  let app: INestApplication;
  let module: TestingModule;

  let userRepository: Repository<UserEntity>;

  let req: TestAgent;

  let memberTokenHeaders: any;
  let withHeadersIncludeMemberToken: any;

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

    memberTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.MEMBER,
    );
    withHeadersIncludeMemberToken = withHeadersBy(memberTokenHeaders);
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

  describe('POST /posts', () => {
    const rootApiPath = '/posts';

    it('success create user successfully and return 201', async () => {
      // given
      const params = mockCreatePostDto();

      // when
      const res = await withHeadersIncludeMemberToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectPostResponseSucceed(body);
    });

    it('should return 400 when title is missing', async () => {
      // given
      const params = mockCreatePostDto();

      params.title = undefined as any;

      // when
      const res = await withHeadersIncludeMemberToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when contents is missing', async () => {
      // given
      const params = mockCreatePostDto();

      params.contents = undefined as any;

      // when
      const res = await withHeadersIncludeMemberToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when title is invalid', async () => {
      // given
      const params = mockCreatePostDto();
      params.title = 'a'.repeat(101);

      // when
      const res = await withHeadersIncludeMemberToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when published is invalid', async () => {
      // given
      const params = mockCreatePostDto();
      const published = 'TRUE';

      // when
      const res = await withHeadersIncludeMemberToken(
        req.post(`${rootApiPath}`).send({ ...params, published }),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });
  });
});
