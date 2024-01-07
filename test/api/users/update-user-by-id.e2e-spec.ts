import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { DtoValidationPipe } from 'src/common/pipes/dto-validation.pipe';
import { UserEntity } from 'src/modules/users/user.entity';
import { UserModule } from 'src/modules/users/user.module';
import { getDbConfig } from 'src/typeorm/db.config';
import * as request from 'supertest';
import { expectResponseFailed } from 'test/expectation/common';
import { expectUserResponseSucceed } from 'test/expectation/user';
import { createUser, mockUserRaw } from 'test/mockup/user';
import { Repository } from 'typeorm';

describe('User API Test', () => {
  let app: INestApplication;
  let testingModule: TestingModule;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [UserModule, TypeOrmModule.forRoot(getDbConfig([UserEntity]))],
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
      const res = await request(app.getHttpServer())
        .put(`${rootApiPath}/${userId}`)
        .send(params)
        .expect(200);

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
      const res = await request(app.getHttpServer())
        .put(`${rootApiPath}/${userId}`)
        .send(params)
        .expect(400);

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
      const res = await request(app.getHttpServer())
        .put(`${rootApiPath}/${userId}`)
        .send(params)
        .expect(400);

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
      const res = await request(app.getHttpServer())
        .put(`${rootApiPath}/${nonExistentId}`)
        .send(params)
        .expect(404);

      // then
      expectResponseFailed(res);
    });
  });
});
