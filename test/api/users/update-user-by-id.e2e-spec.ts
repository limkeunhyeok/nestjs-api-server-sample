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
import { Role, UserEntity } from 'src/modules/users/user.entity';
import { UserModule } from 'src/modules/users/user.module';
import { getDbConfig } from 'src/typeorm/db.config';
import * as request from 'supertest';
import { expectResponseFailed } from 'test/expectation/common';
import { expectUserResponseSucceed } from 'test/expectation/user';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { createUser, mockUserRaw } from 'test/mockup/user';
import { Repository } from 'typeorm';

@Module({
  imports: [
    HealthCheckModule,
    AuthModule,
    TypeOrmModule.forRoot(getDbConfig([UserEntity])),
    UserModule,
  ],
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '/users/*', method: RequestMethod.PUT });
  }
}

describe('User API Test', () => {
  let app: INestApplication;
  let req: request.SuperTest<request.Test>;

  let testingModule: TestingModule;
  let userRepository: Repository<UserEntity>;

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
    await userRepository.delete({});

    await app.close();
  });

  describe('PUT /users/:id', () => {
    const rootApiPath = '/users';

    it('success - update user by id (200)', async () => {
      // given
      const user = await createUser(userRepository);
      const userId = user.id;

      const userRaw = mockUserRaw();
      const params = {
        password: userRaw.password,
        role: userRaw.role,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.put(`${rootApiPath}/${userId}`).send(params),
      ).expect(200);

      // then
      const body = res.body;
      expectUserResponseSucceed(body, userRaw);
    });

    it('failed - invalid password (400)', async () => {
      // given
      const user = await createUser(userRepository);
      const userId = user.id;

      const userRaw = mockUserRaw();
      const params = {
        password: 'example',
        role: userRaw.role,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.put(`${rootApiPath}/${userId}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid role (400)', async () => {
      // given
      const user = await createUser(userRepository);
      const userId = user.id;

      const userRaw = mockUserRaw();
      const params = {
        password: userRaw.password,
        role: 'role',
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.put(`${rootApiPath}/${userId}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - not found user entity (404)', async () => {
      // given
      const user = await createUser(userRepository);
      const nonExistentId = 2 ** 31 - 1;

      const userRaw = mockUserRaw();
      const params = {
        password: userRaw.password,
        role: userRaw.role,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        req.put(`${rootApiPath}/${nonExistentId}`).send(params),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });
  });
});
