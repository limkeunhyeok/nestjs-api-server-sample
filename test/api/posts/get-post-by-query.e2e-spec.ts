import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { addDays, subDays } from 'date-fns';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { HealthCheckModule } from 'src/common/health-check/health-check.module';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';
import { DtoValidationPipe } from 'src/common/pipes/dto-validation.pipe';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PostEntity } from 'src/modules/posts/post.entity';
import { PostModule } from 'src/modules/posts/post.module';
import { Role, UserEntity } from 'src/modules/users/user.entity';
import { UserModule } from 'src/modules/users/user.module';
import { getDbConfig } from 'src/typeorm/db.config';
import * as request from 'supertest';
import {
  expectPagingResponseSucceed,
  expectResponseFailed,
} from 'test/expectation/common';
import { expectPostResponseSucceed } from 'test/expectation/post';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { createPost, mockPostRaw } from 'test/mockup/post';
import { Repository } from 'typeorm';

@Module({
  imports: [
    HealthCheckModule,
    AuthModule,
    TypeOrmModule.forRoot(getDbConfig([UserEntity, PostEntity])),
    UserModule,
    PostModule,
  ],
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/posts', method: RequestMethod.GET },
        { path: '/auth/me', method: RequestMethod.GET },
      );
  }
}

describe('Post API Test', () => {
  let app: INestApplication;
  let req: request.SuperTest<request.Test>;

  let testingModule: TestingModule;
  let userRepository: Repository<UserEntity>;
  let postRepository: Repository<PostEntity>;

  let adminTokenHeaders: any;
  let withHeadersIncludeAdminToken: any;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = testingModule.createNestApplication();

    app.useGlobalPipes(new DtoValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();

    userRepository = testingModule.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    postRepository = testingModule.get<Repository<PostEntity>>(
      getRepositoryToken(PostEntity),
    );

    req = request(app.getHttpServer());

    adminTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.ADMIN,
    );
    withHeadersIncludeAdminToken = withHeadersBy(adminTokenHeaders);
  });

  afterAll(async () => {
    await postRepository.delete({});
    await userRepository.delete({});

    await app.close();
  });

  describe('GET /posts', () => {
    const rootApiPath = '/posts';

    it('success - get posts (200)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
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
        sortingField: 'createdAt',
        sortingDirection: 'desc',
        authorId: user.id,
        published: true,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(200);

      // then
      expectPagingResponseSucceed(res);

      const body = res.body;
      for (const post of body.data) {
        expectPostResponseSucceed(post);
      }
    });

    it('failed - invalid date (400)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
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
        sortingField: 'createdAt',
        sortingDirection: 'desc',
        authorId: user.id,
        published: true,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid published (400)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
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
        sortingField: 'createdAt',
        sortingDirection: 'desc',
        authorId: user.id,
        published: 'EXAMPLE',
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid authorId (422)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
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
        sortingField: 'createdAt',
        sortingDirection: 'desc',
        authorId: 'authorId',
        published: true,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid limit (422)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
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
        sortingField: 'createdAt',
        sortingDirection: 'desc',
        authorId: user.id,
        published: true,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(422);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid offset (422)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
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
        sortingField: 'createdAt',
        sortingDirection: 'desc',
        authorId: user.id,
        published: true,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(422);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid sorting direction (400)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
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
        sortingField: 'createdAt',
        sortingDirection: 'direction',
        authorId: user.id,
        published: true,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid sorting field (422)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
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
        sortingField: 'field',
        sortingDirection: 'desc',
        authorId: user.id,
        published: true,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}`).query(params),
      ).expect(422);

      // then
      expectResponseFailed(res);
    });
  });
});
