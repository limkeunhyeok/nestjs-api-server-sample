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
import { mockCreatePostDto } from 'test/mockup/post';
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
      .forRoutes({ path: '/posts', method: RequestMethod.POST });
  }
}

describe('Post API Test', () => {
  let app: INestApplication;
  let req: request.SuperTest<request.Test>;

  let testingModule: TestingModule;
  let userRepository: Repository<UserEntity>;
  let postRepository: Repository<PostEntity>;

  let memberTokenHeaders: any;
  let withHeadersIncludeMemberToken: any;

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

    memberTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.MEMBER,
    );
    withHeadersIncludeMemberToken = withHeadersBy(memberTokenHeaders);
  });

  afterAll(async () => {
    await postRepository.delete({});
    await userRepository.delete({});

    await app.close();
  });

  describe('POST /posts', () => {
    const rootApiPath = '/posts';

    it('success - create post (201)', async () => {
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

    it('failed - required title (400)', async () => {
      // given
      const params = mockCreatePostDto();
      delete params.title;

      // when
      const res = await withHeadersIncludeMemberToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - required contents (400)', async () => {
      // given
      const params = mockCreatePostDto();
      delete params.contents;

      // when
      const res = await withHeadersIncludeMemberToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - required published (400)', async () => {
      // given
      const params = mockCreatePostDto();
      delete params.published;

      // when
      const res = await withHeadersIncludeMemberToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid title (400)', async () => {
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

    it('failed - invalid published (400)', async () => {
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
