import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/user.entity';
import { expectResponseFailed } from 'test/expectation/common';
import { initE2ETest } from 'test/lib/init-e2e-test';
import { fetchHeaders, withHeadersBy } from 'test/lib/utils';
import { createUser, mockUserRaw } from 'test/mockup/user';
import { Repository } from 'typeorm';

describe('Logout API Test', () => {
  let userRepository: Repository<UserEntity>;
  let userRaw: any;
  let headers: any;
  let withHeaders: any;

  const ctx = initE2ETest(async ({ module, req }) => {
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    userRaw = await mockUserRaw();
    await createUser(userRepository, userRaw);

    headers = await fetchHeaders(req, userRaw);
    withHeaders = withHeadersBy(headers);
  });

  describe('POST /auth/logout', () => {
    const rootApiPath = '/auth/logout';

    it('should return 201 when logging out successfully', async () => {
      // when: We log out using the token acquired in the test setup
      const res = await withHeaders(ctx.req.post(rootApiPath)).expect(201);

      // then: Expect message body
      expect(res.body.message).toBeDefined();
    });

    it('should return 401 Unauthorized when trying to use a logged-out token', async () => {
      // given: The token from `withHeaders` is now blacklisted.
      // when: Trying to access a protected route (e.g. GET /users/me)
      const res = await withHeaders(ctx.req.get('/users/me')).expect(401);

      // then
      expectResponseFailed(res);
      expect(res.body.message).toContain('Token has been revoked');
      expect(res.body.status).toBe(401);
    });

    it('should return 401 when calling logout without token', async () => {
       // when
       const res = await ctx.req.post(rootApiPath).expect(401);

       // then
       expectResponseFailed(res);
       expect(res.body.status).toBe(401);
    });
  });
});
