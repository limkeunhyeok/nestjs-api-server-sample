import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/constants/role.const';
import { UserEntity } from 'src/modules/users/user.entity';
import { expectResponseFailed } from 'test/expectation/common';
import { expectPostResponseSucceed } from 'test/expectation/post';
import { initE2ETest } from 'test/lib/init-e2e-test';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { mockCreatePostDto } from 'test/mockup/post';
import { Repository } from 'typeorm';

describe('Post API Test', () => {
  let userRepository: Repository<UserEntity>;

  let memberTokenHeaders: any;
  let withHeadersIncludeMemberToken: any;

  const ctx = initE2ETest(async ({ module, req }) => {
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    memberTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.MEMBER,
    );
    withHeadersIncludeMemberToken = withHeadersBy(memberTokenHeaders);
  });

  describe('POST /posts', () => {
    const rootApiPath = '/posts';

    it('success create user successfully and return 201', async () => {
      // given
      const params = mockCreatePostDto();

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectPostResponseSucceed(body);
    });

    it('should return 400 when title is missing', async () => {
      // given
      const params = mockCreatePostDto();

      params.title = undefined as any;

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when contents is missing', async () => {
      // given
      const params = mockCreatePostDto();

      params.contents = undefined as any;

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when title is invalid', async () => {
      // given
      const params = mockCreatePostDto();
      params.title = 'a'.repeat(101);

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req.post(`${rootApiPath}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when published is invalid', async () => {
      // given
      const params = mockCreatePostDto();
      const published = 'TRUE';

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req.post(`${rootApiPath}`).send({ ...params, published }),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });
  });
});
