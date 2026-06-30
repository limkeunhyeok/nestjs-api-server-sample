import { getRepositoryToken } from '@nestjs/typeorm';
import { addDays, subDays } from 'date-fns';
import { Role } from 'src/common/constants/role.const';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/user.orm-entity';
import {
  expectPagingResponseSucceed,
  expectResponseFailed,
} from 'test/expectation/common';
import { expectUserResponseSucceed } from 'test/expectation/user';
import { initE2ETest } from 'test/lib/init-e2e-test';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { createUser } from 'test/mockup/user';
import { Repository } from 'typeorm';

describe('User API Test', () => {
  let userRepository: Repository<UserEntity>;

  let adminTokenHeaders: any;
  let withHeadersIncludeAdminToken: any;

  const ctx = initE2ETest(async ({ module, req }) => {
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    adminTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.ADMIN,
    );
    withHeadersIncludeAdminToken = withHeadersBy(adminTokenHeaders);
  });

  describe('GET /users', () => {
    const rootApiPath = '/users';

    it('should get user successfully and return 200', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        role: Role.MEMBER,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        ctx.req.get(`${rootApiPath}`).query(params),
      ).expect(200);

      // then
      expectPagingResponseSucceed(res);

      const body = res.body;
      for (const user of body.data) {
        expectUserResponseSucceed(user);
      }
    });

    it('should return 400 when date is invalid', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: addDays(new Date(), 1),
        endDate: subDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        role: Role.MEMBER,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        ctx.req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when role is invalid', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        role: 'role',
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        ctx.req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when limit is invalid', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: -1,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        role: Role.MEMBER,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        ctx.req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when offset is invalid', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: -1,
        sortField: 'createdAt',
        sortDirection: SortDirection.DESC,
        role: Role.MEMBER,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        ctx.req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when sorting direction is invalid', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'createdAt',
        sortDirection: 'direction',
        role: Role.MEMBER,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        ctx.req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when sorting field is invalid', async () => {
      // given
      await createUser(userRepository);

      const params = {
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortField: 'field',
        sortDirection: SortDirection.DESC,
        role: Role.MEMBER,
      };

      // when
      const res = await withHeadersIncludeAdminToken(
        ctx.req.get(`${rootApiPath}`).query(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });
  });
});
