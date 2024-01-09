import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { DtoValidationPipe } from 'src/common/pipes/dto-validation.pipe';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserEntity } from 'src/modules/users/user.entity';
import { getDbConfig } from 'src/typeorm/db.config';
import * as request from 'supertest';
import { expectTokenResponseSucceed } from 'test/expectation/auth';
import { expectResponseFailed } from 'test/expectation/common';
import { extractSignInParams } from 'test/mockup/auth';
import { createUser, mockUserRaw } from 'test/mockup/user';
import { Repository } from 'typeorm';

describe('Auth API Test', () => {
  let app: INestApplication;
  let testingModule: TestingModule;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [AuthModule, TypeOrmModule.forRoot(getDbConfig([UserEntity]))],
    }).compile();

    app = testingModule.createNestApplication();

    app.useGlobalPipes(new DtoValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();

    userRepository = testingModule.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  afterAll(async () => {
    await userRepository.delete({});

    await app.close();
  });

  describe('POST /auth/sign-in', () => {
    const rootApiPath = '/auth/sign-in';

    it('success - sign in (201)', async () => {
      // given
      const userRaw = mockUserRaw();
      await createUser(userRepository, userRaw);

      const params = extractSignInParams(userRaw);

      // when
      const res = await request(app.getHttpServer())
        .post(`${rootApiPath}`)
        .send(params)
        .expect(201);

      // then
      const body = res.body;
      expectTokenResponseSucceed(body);
    });

    it('failed - required sign in params (400)', async () => {
      // given
      const userRaw = mockUserRaw();
      await createUser(userRepository, userRaw);

      const params = extractSignInParams(userRaw);

      // when
      const res = await request(app.getHttpServer())
        .post(`${rootApiPath}`)
        .expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - email or password is incorrect (400)', async () => {
      // given
      const userRaw = mockUserRaw();
      await createUser(userRepository, userRaw);

      const params = extractSignInParams(userRaw);
      params.email = 'incorrect@email.com';

      // when
      const res = await request(app.getHttpServer())
        .post(`${rootApiPath}`)
        .send(params)
        .expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - email or password is incorrect (400)', async () => {
      // given
      const userRaw = mockUserRaw();
      await createUser(userRepository, userRaw);

      const params = extractSignInParams(userRaw);
      params.password = 'incorrect';

      // when
      const res = await request(app.getHttpServer())
        .post(`${rootApiPath}`)
        .send(params)
        .expect(400);

      // then
      expectResponseFailed(res);
    });
  });
});
