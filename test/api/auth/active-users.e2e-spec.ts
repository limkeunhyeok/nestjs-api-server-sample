import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/constants/role.const';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/entities/user.orm-entity';
import { expectResponseFailed } from 'test/expectation/common';
import { initE2ETest } from 'test/lib/init-e2e-test';
import { fetchHeaders, fetchHeadersByMember, withHeadersBy } from 'test/lib/utils';
import { createUser, mockUserRaw } from 'test/mockup/user';
import { Repository } from 'typeorm';

describe('Active Users API Test', () => {
  let userRepository: Repository<UserEntity>;
  let adminRaw: any;
  let adminHeaders: any;
  let withAdminHeaders: any;

  let memberRaw: any;
  let memberHeaders: any;
  let withMemberHeaders: any;

  const ctx = initE2ETest(async ({ module, req }) => {
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    // Create Admin User
    adminRaw = await mockUserRaw();
    adminRaw.role = Role.ADMIN;
    const adminUser = await createUser(userRepository, adminRaw);
    adminRaw.id = adminUser.id;
    adminHeaders = await fetchHeaders(req, adminRaw);
    withAdminHeaders = withHeadersBy(adminHeaders);

    // Create Normal Member User
    memberRaw = await mockUserRaw();
    const memberUser = await createUser(userRepository, memberRaw);
    memberRaw.id = memberUser.id;
    memberHeaders = await fetchHeadersByMember(req, memberRaw);
    withMemberHeaders = withHeadersBy(memberHeaders);
  });

  describe('GET /auth/active-users/count', () => {
    const rootApiPath = '/auth/active-users/count';

    it('should return 200 and the count of active users when called by ADMIN', async () => {
      // when
      const res = await withAdminHeaders(ctx.req.get(rootApiPath)).expect(200);

      // then
      const body = res.body;
      expect(body.count).toBeDefined();
      expect(typeof body.count).toBe('number');
      // Given that we fetched headers for Admin, we don't strictly know if Cache tracks it properly yet.
      // E2E Redis cache might be distinct or delayed. Let's just expect it's a number for now, or check trackUser logic.
      expect(body.count).toBeGreaterThanOrEqual(1);
    });

    it('should return 403 when called by normal MEMBER', async () => {
      // when
      const res = await withMemberHeaders(ctx.req.get(rootApiPath)).expect(403);

      // then
      expectResponseFailed(res);
      expect(res.body.status).toBe(403);
    });
  });

  describe('GET /auth/active-users', () => {
    const rootApiPath = '/auth/active-users';

    it('should return 200 and array of active user IDs when called by ADMIN', async () => {
      // when
      const res = await withAdminHeaders(ctx.req.get(rootApiPath)).expect(200);

      // then
      const body = res.body;
      expect(body.userIds).toBeDefined();
      expect(Array.isArray(body.userIds)).toBe(true);
      // Admin Id should be in the list since they just logged in/fetched headers
      expect(body.userIds).toContain(adminRaw.id.toString());
    });

    it('should return 403 when called by normal MEMBER', async () => {
      // when
      const res = await withMemberHeaders(ctx.req.get(rootApiPath)).expect(403);

      expectResponseFailed(res);
      expect(res.body.status).toBe(403);
    });
  });
});
