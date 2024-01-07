import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { DtoValidationPipe } from 'src/common/pipes/dto-validation.pipe';
import { UserEntity } from 'src/modules/users/user.entity';
import { getDbConfig } from 'src/typeorm/db.config';
import * as request from 'supertest';
import { expectVerifyResponseSucceed } from 'test/expectation/auth';
import { createUser, mockUserRaw } from 'test/mockup/user';
import { Repository } from 'typeorm';

describe('Auth API Test', () => {
  let app: INestApplication;
  let testingModule: TestingModule;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(getDbConfig([UserEntity]))],
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

  describe('POST /auth/verify-password', () => {
    const rootApiPath = '/auth/verify-password';

    it('success - correct password (201)', async () => {
      // given
      const userRaw = mockUserRaw();
      await createUser(userRepository, userRaw);

      const params = {
        confirmPassword: userRaw.password,
      };

      // when
      const res = await request(app.getHttpServer())
        .post(`${rootApiPath}`)
        .send(params)
        .expect(201);

      // then
      const body = res.body;
      expectVerifyResponseSucceed(body, true);
    });

    it('success - incorrect password (201)', async () => {
      // given
      const userRaw = mockUserRaw();
      await createUser(userRepository, userRaw);

      const params = {
        confirmPassword: 'incorrect password',
      };

      // when
      const res = await request(app.getHttpServer())
        .post(`${rootApiPath}`)
        .send(params)
        .expect(201);

      // then
      const body = res.body;
      expectVerifyResponseSucceed(body, false);
    });
  });
});
