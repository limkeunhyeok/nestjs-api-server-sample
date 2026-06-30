import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/constants/role.const';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/user.orm-entity';
import { expectResponseFailed } from 'test/expectation/common';
import { initE2ETest } from 'test/lib/init-e2e-test';
import {
  fetchHeaders,
  fetchHeadersByMember,
  withHeadersBy,
} from 'test/lib/utils';
import { createUser, mockUserRaw } from 'test/mockup/user';
import { Repository } from 'typeorm';

describe('Dev Tokens API Test', () => {
  let userRepository: Repository<UserEntity>;
  let adminRaw: any;
  let adminHeaders: any;
  let withAdminHeaders: any;

  let memberRaw: any;
  let memberHeaders: any;
  let withMemberHeaders: any;

  // Track created dev token ids to clean up or verify later
  let createdDevTokenId: number | null = null;
  let createdDevTokenString: string | null = null;

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

  describe('POST /auth/dev-tokens', () => {
    const rootApiPath = '/auth/dev-tokens';

    it('should return 201 and create a dev token when called by ADMIN', async () => {
      // given
      const params = {
        name: 'test-dev-token',
        expiresIn: '1d',
        role: Role.MEMBER,
      };

      // when
      const res = await withAdminHeaders(
        ctx.req.post(rootApiPath).send(params),
      );

      if (res.status !== 201) {
        console.log(
          'Failed to create dev token. Status:',
          res.status,
          'Body:',
          res.body,
        );
      }
      expect(res.status).toBe(201);

      // then
      const body = res.body;
      expect(body.token).toBeDefined();
      expect(typeof body.token).toBe('string');
      expect(body.devToken).toBeDefined();
      expect(body.devToken.name).toBe(params.name);
      expect(body.devToken.createdBy).toBe(adminRaw.id);

      createdDevTokenId = body.devToken.id;
      createdDevTokenString = body.token;
    });

    it('should return 403 when called by normal MEMBER', async () => {
      // given
      const params = { name: 'unauthorized-token' };

      // when
      const res = await withMemberHeaders(
        ctx.req.post(rootApiPath).send(params),
      ).expect(403);

      // then
      expectResponseFailed(res);
      expect(res.body.status ?? res.body.statusCode).toBe(403);
    });
  });

  describe('GET /auth/dev-tokens', () => {
    const rootApiPath = '/auth/dev-tokens';

    it('should return 200 and a list of dev tokens when called by ADMIN', async () => {
      // when
      const res = await withAdminHeaders(ctx.req.get(rootApiPath));
      if (res.status !== 200) {
        console.log(
          'GET /auth/dev-tokens failed. Status:',
          res.status,
          'Body:',
          res.body,
        );
      }
      expect(res.status).toBe(200);

      // then
      const body = res.body;
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body.some((token: any) => token.id === createdDevTokenId)).toBe(
        true,
      );
    });

    it('should return 403 when called by normal MEMBER', async () => {
      // when
      const res = await withMemberHeaders(ctx.req.get(rootApiPath)).expect(403);

      // then
      expectResponseFailed(res);
      expect(res.body.status).toBe(403);
    });
  });

  describe('DELETE /auth/dev-tokens/:id', () => {
    const rootApiPath = '/auth/dev-tokens';

    it('should return 403 when called by normal MEMBER to revoke', async () => {
      // when
      const res = await withMemberHeaders(
        ctx.req.delete(`${rootApiPath}/${createdDevTokenId}`),
      ).expect(403);

      // then
      expectResponseFailed(res);
      expect(res.body.status).toBe(403);
    });

    it('should return 200 and revoke the token when called by ADMIN', async () => {
      // when
      const res = await withAdminHeaders(
        ctx.req.delete(`${rootApiPath}/${createdDevTokenId}`),
      ).expect(200);

      // then
      const body = res.body;
      expect(body.id).toBe(createdDevTokenId);
      expect(body.revokedAt).not.toBeNull();
    });

    it('should reject access with revoked dev token', async () => {
      // when using the revoked token on a protected endpoint, it should fail
      // We can use GET /users/me as a protected endpoint test
      const res = await ctx.req
        .get('/users/me')
        .set('Authorization', `Bearer ${createdDevTokenString}`)
        .expect(401);

      // then
      expectResponseFailed(res);
      expect(res.body.status).toBe(401);
      expect(res.body.message).toContain('Dev token has been revoked');
    });
  });
});
