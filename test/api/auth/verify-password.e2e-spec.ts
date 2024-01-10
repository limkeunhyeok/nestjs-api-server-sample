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
import { UserEntity } from 'src/modules/users/user.entity';
import { UserModule } from 'src/modules/users/user.module';
import { getDbConfig } from 'src/typeorm/db.config';
import * as request from 'supertest';
import { expectVerifyResponseSucceed } from 'test/expectation/auth';
import { expectResponseFailed } from 'test/expectation/common';
import { fetchHeaders, withHeadersBy } from 'test/lib/utils';
import { extractSignInParams } from 'test/mockup/auth';
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
      .forRoutes({ path: '/auth/verify-password', method: RequestMethod.POST });
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

  describe('POST /auth/verify-password', () => {
    const rootApiPath = '/auth/verify-password';

    it('success - correct password (201)', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);
      const signInRes = await withHeaders(
        req.post('/auth/sign-in').send(signInParams),
      ).expect(201);

      const { accessToken } = signInRes.body;
      withHeaders = withHeadersBy({ token: accessToken });

      const params = {
        confirmPassword: userRaw.password,
      };

      // when
      const res = await withHeaders(
        req.post(`${rootApiPath}`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectVerifyResponseSucceed(body, true);
    });

    it('success - incorrect password (201)', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);
      const signInRes = await withHeaders(
        req.post('/auth/sign-in').send(signInParams),
      ).expect(201);

      const { accessToken } = signInRes.body;
      withHeaders = withHeadersBy({ token: accessToken });

      const params = {
        confirmPassword: 'incorrect',
      };

      // when
      const res = await withHeaders(
        req.post(`${rootApiPath}`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectVerifyResponseSucceed(body, false);
    });

    it('failed - required password (400)', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);
      const signInRes = await withHeaders(
        req.post('/auth/sign-in').send(signInParams),
      ).expect(201);

      const { accessToken } = signInRes.body;
      withHeaders = withHeadersBy({ token: accessToken });

      const params = {};

      // when
      const res = await withHeaders(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid password (400)', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);
      const signInRes = await withHeaders(
        req.post('/auth/sign-in').send(signInParams),
      ).expect(201);

      const { accessToken } = signInRes.body;
      withHeaders = withHeadersBy({ token: accessToken });

      const params = {
        confirmPassword: 'example',
      };

      // when
      const res = await withHeaders(
        req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid token (401)', async () => {
      // given
      const signInParams = extractSignInParams(userRaw);
      const signInRes = await withHeaders(
        req.post('/auth/sign-in').send(signInParams),
      ).expect(201);

      const { accessToken } = signInRes.body;
      withHeaders = withHeadersBy({ token: 'invalidAccessToken' });

      const params = {
        confirmPassword: userRaw.password,
      };

      // when
      const res = await withHeaders(
        req.post(`${rootApiPath}`).send(params),
      ).expect(401);

      // then
      expectResponseFailed(res);
    });
  });
});
