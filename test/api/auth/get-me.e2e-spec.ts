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
import { UserEntity } from 'src/modules/users/user.entity';
import { UserModule } from 'src/modules/users/user.module';
import { getDbConfig } from 'src/typeorm/db.config';
import * as request from 'supertest';
import { expectUserResponseSucceed } from 'test/expectation/user';
import { fetchHeaders, withHeadersBy } from 'test/lib/utils';
import { extractSignInParams } from 'test/mockup/auth';
import { createUser, mockUserRaw } from 'test/mockup/user';
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
  ],
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '/auth/me', method: RequestMethod.GET });
  }
}

describe('Auth API Test', () => {
  let app: INestApplication;
  let req: request.SuperTest<request.Test>;

  let testingModule: TestingModule;
  let userRepository: Repository<UserEntity>;

  let userRaw: any;
  let headers: any;
  let withHeaders: any;

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

    req = request(app.getHttpServer());

    userRaw = mockUserRaw();
    await createUser(userRepository, userRaw);

    headers = await fetchHeaders(req);
    withHeaders = withHeadersBy(headers);
  });

  afterAll(async () => {
    await userRepository.delete({});

    await app.close();
  });

  describe('POST /auth/me', () => {
    const rootApiPath = '/auth/me';

    it('success - get me (200)', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);
      const signInRes = await withHeaders(
        req.post('/auth/sign-in').send(signInParams),
      ).expect(201);

      const { accessToken } = signInRes.body;
      withHeaders = withHeadersBy({ token: accessToken });

      // when
      const res = await withHeaders(req.get(`${rootApiPath}`)).expect(200);

      // then
      const body = res.body;
      expectUserResponseSucceed(body);
    });
  });
});
