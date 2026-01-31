import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { addDays, subDays } from 'date-fns';
import { Role } from 'src/common/constants/role.const';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PostEntity } from 'src/modules/posts/entities/post.entity';
import { UserEntity } from 'src/modules/users/user.entity';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import {
  expectPagingResponseSucceed,
  expectResponseFailed,
} from 'test/expectation/common';
import { expectPostResponseSucceed } from 'test/expectation/post';
import { createTestApp } from 'test/lib/create-test-app';
import { TestService } from 'test/lib/test.service';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { createPost, mockPostRaw } from 'test/mockup/post';
import { Repository } from 'typeorm';

const globalAny: any = global;

describe('Post API Test', () => {
  let app: INestApplication;
  let module: TestingModule;

  let userRepository: Repository<UserEntity>;
  let postRepository: Repository<PostEntity>;

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
    postRepository = module.get<Repository<PostEntity>>(
      getRepositoryToken(PostEntity),
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

  describe('GET /posts', () => {
    const rootApiPath = '/posts';

    it('should get post successfully and return 200', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        authorId: user.id,
        published: true,
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(200);

      // then
      expectPagingResponseSucceed(res);

      const body = res.body;
      for (const data of body.data) {
        expectPostResponseSucceed(data, post);
      }
    });

    it('should return 400 when date is invalid', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = {
        startDate: addDays(new Date(), 1),
        endDate: subDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        authorId: user.id,
        published: true,
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when published is invalid', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        authorId: user.id,
        published: 'TRUE',
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when author id is invalid', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        authorId: 'authorId',
        published: true,
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when limit is invalid', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: -1,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        authorId: user.id,
        published: true,
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when offset is invalid', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: -1,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        authorId: user.id,
        published: true,
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when sorting direction is invalid', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: 'direction',
        authorId: user.id,
        published: true,
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when sorting field is invalid', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'field',
        sortDirection: SortDirection.DESC,
        authorId: user.id,
        published: true,
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });
  });
});
