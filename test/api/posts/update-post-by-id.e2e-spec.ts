import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
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
import { expectResponseFailed } from 'test/expectation/common';
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
        { path: '/posts/*', method: RequestMethod.PUT },
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

  let memberTokenHeaders: any;
  let withHeadersIncludeMemberToken: any;

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

    memberTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.MEMBER,
    );
    withHeadersIncludeMemberToken = withHeadersBy(adminTokenHeaders);
  });

  afterAll(async () => {
    await postRepository.delete({});
    await userRepository.delete({});

    await app.close();
  });

  describe('PUT /posts/:id', () => {
    const rootApiPath = '/posts';

    it('success - update post by id (200)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const postParams = mockPostRaw(user);
      const params = {
        title: postParams.title,
        contents: postParams.contents,
        published: postParams.published,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.put(`${rootApiPath}/${post.id}`).send(params),
      ).expect(200);

      // then
      const body = res.body;
      expectPostResponseSucceed(body, params);
    });

    it('failed - invalid title (400)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const postParams = mockPostRaw(user);
      const params = {
        title: 'a'.repeat(101),
        contents: postParams.contents,
        published: postParams.published,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.put(`${rootApiPath}/${post.id}`).send(params),
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

      const postParams = mockPostRaw(user);
      const params = {
        title: postParams.title,
        contents: postParams.contents,
        published: 'EXAMPLE',
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.put(`${rootApiPath}/${post.id}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('success - update post by id (200)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const postParams = mockPostRaw(user);
      const params = {
        title: postParams.title,
        contents: postParams.contents,
        published: postParams.published,
      };
      const nonExistentId = 2 ** 31 - 1;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.put(`${rootApiPath}/${nonExistentId}`).send(params),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });
  });
});
