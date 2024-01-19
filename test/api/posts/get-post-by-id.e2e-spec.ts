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
import { CommentEntity } from 'src/modules/comments/comment.entity';
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
import { DataSource, Repository } from 'typeorm';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';

@Module({
  imports: [
    HealthCheckModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      useFactory() {
        return getDbConfig([UserEntity, PostEntity, CommentEntity]);
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed.');
        }
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    UserModule,
    PostModule,
  ],
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/posts/*', method: RequestMethod.GET },
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

  initializeTransactionalContext();

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

  describe('GET /posts/:id', () => {
    const rootApiPath = '/posts';

    it('success - get post by id (200)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}/${post.id}`),
      ).expect(200);

      // then
      const body = res.body;
      expectPostResponseSucceed(body);
    });

    it('failed - not found user entity (404)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);
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
