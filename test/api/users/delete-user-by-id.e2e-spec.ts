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
import { createUser } from 'test/mockup/user';
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

  describe('DELETE /users/:id', () => {
    const rootApiPath = '/users';

    it('success - delete user by id (200)', async () => {
      // given
      const user = await createUser(userRepository);
      const userId = user.id;

      // when
      const res = await request(app.getHttpServer())
        .delete(`${rootApiPath}/${userId}`)
        .expect(200);

      // then
      const body = res.body;
      expectUserResponseSucceed(body);
    });

    it('failed - not found user entity (404)', async () => {
      // given
      const user = await createUser(userRepository);
      const nonExistentId = 2 ** 31 - 1;

      // when
      const res = await request(app.getHttpServer())
        .delete(`${rootApiPath}/${nonExistentId}`)
        .expect(404);

      // then
      expectResponseFailed(res);
    });
  });
});
