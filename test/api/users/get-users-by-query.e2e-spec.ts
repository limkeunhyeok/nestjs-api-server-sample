import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { addDays, subDays } from 'date-fns';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { DtoValidationPipe } from 'src/common/pipes/dto-validation.pipe';
import { Role, UserEntity } from 'src/modules/users/user.entity';
import { UserModule } from 'src/modules/users/user.module';
import { getDbConfig } from 'src/typeorm/db.config';
import * as request from 'supertest';
import {
  expectPagingResponseSucceed,
  expectResponseFailed,
} from 'test/expectation/common';
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

  describe('GET /users', () => {
    const rootApiPath = '/users';

    it('success - get users (200)', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortingField: 'createdAt',
        sortingDirection: 'desc',
        role: Role.MEMBER,
      };

      // when
      const res = await request(app.getHttpServer())
        .get(`${rootApiPath}`)
        .query(params)
        .expect(200);

      // then
      expectPagingResponseSucceed(res);

      const body = res.body;
      for (const user of body.data) {
        expectUserResponseSucceed(user);
      }
    });

    it('failed - invalid date (400)', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: addDays(new Date(), 1),
        endDate: subDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortingField: 'createdAt',
        sortingDirection: 'desc',
        role: Role.MEMBER,
      };

      // when
      const res = await request(app.getHttpServer())
        .get(`${rootApiPath}`)
        .query(params)
        .expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid role (400)', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortingField: 'createdAt',
        sortingDirection: 'desc',
        role: 'role',
      };

      // when
      const res = await request(app.getHttpServer())
        .get(`${rootApiPath}`)
        .query(params)
        .expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid limit (422)', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: -1,
        offset: 0,
        sortingField: 'createdAt',
        sortingDirection: 'desc',
        role: Role.MEMBER,
      };

      // when
      const res = await request(app.getHttpServer())
        .get(`${rootApiPath}`)
        .query(params)
        .expect(422);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid offset (422)', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: -1,
        sortingField: 'createdAt',
        sortingDirection: 'desc',
        role: Role.MEMBER,
      };

      // when
      const res = await request(app.getHttpServer())
        .get(`${rootApiPath}`)
        .query(params)
        .expect(422);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid sorting direction (400)', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortingField: 'createdAt',
        sortingDirection: 'direction',
        role: Role.MEMBER,
      };

      // when
      const res = await request(app.getHttpServer())
        .get(`${rootApiPath}`)
        .query(params)
        .expect(400);

      // then
      expectResponseFailed(res);
    });

    it('failed - invalid sorting field (422)', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortingField: 'field',
        sortingDirection: 'desc',
        role: Role.MEMBER,
      };

      // when
      const res = await request(app.getHttpServer())
        .get(`${rootApiPath}`)
        .query(params)
        .expect(422);

      // then
      expectResponseFailed(res);
    });
  });
});