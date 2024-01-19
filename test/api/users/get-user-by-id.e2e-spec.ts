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
import { createUser } from 'test/mockup/user';
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
      .forRoutes({ path: '/users/*', method: RequestMethod.GET });
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

  describe('GET /users/:id', () => {
    const rootApiPath = '/users';

    it('success - get user by id (200)', async () => {
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

    it('failed - not found user entity (404)', async () => {
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
