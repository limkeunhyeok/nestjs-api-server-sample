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
import { Role, UserEntity } from 'src/modules/users/user.entity';
import { UserModule } from 'src/modules/users/user.module';
import { getDbConfig } from 'src/typeorm/db.config';
import * as request from 'supertest';
import { expectResponseFailed } from 'test/expectation/common';
import { expectUserResponseSucceed } from 'test/expectation/user';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import {
  createUser,
  extractUserCreationParams,
  mockUserRaw,
} from 'test/mockup/user';
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
      .forRoutes({ path: '/users', method: RequestMethod.POST });
  }
}

describe('User API Test', () => {
  let app: INestApplication;
  let req: request.SuperTest<request.Test>;

  let testingModule: TestingModule;
  let userRepository: Repository<UserEntity>;

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

    req = request(app.getHttpServer());

    adminTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.ADMIN,
    );
    withHeadersIncludeAdminToken = withHeadersBy(adminTokenHeaders);
  });

  afterAll(async () => {
    await userRepository.delete({});

    await app.close();
  });

  describe('POST /users', () => {
    const rootApiPath = '/users';

    it('success - create user (201)', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectUserResponseSucceed(body);
    });

    it('failed - required email (400)', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);
      delete params.email;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - required password (400)', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);
      delete params.password;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - required role (400)', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);
      delete params.role;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid email (400)', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);
      params.email = 'example';

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid password (400)', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);
      params.password = 'example';

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid role (400)', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);
      params.role = 'role' as Role;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - duplicated email (400)', async () => {
      // given
      const userRaw = mockUserRaw();
      const params = extractUserCreationParams(userRaw);

      await createUser(userRepository, userRaw);

      // when
      const res = await withHeadersIncludeAdminToken(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });
  });
});
