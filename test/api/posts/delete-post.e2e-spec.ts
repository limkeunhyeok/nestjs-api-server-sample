import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/constants/role.const';
import { PostEntity } from 'src/modules/posts/infrastructure/persistence/post.orm-entity';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/user.orm-entity';
import { expectResponseFailed } from 'test/expectation/common';
import { expectPostResponseSucceed } from 'test/expectation/post';
import { initE2ETest } from 'test/lib/init-e2e-test';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { createPost, mockPostRaw } from 'test/mockup/post';
import { createUser } from 'test/mockup/user';
import { Repository } from 'typeorm';

describe('Post API Test', () => {
  let userRepository: Repository<UserEntity>;
  let postRepository: Repository<PostEntity>;

  let memberTokenHeaders: any;
  let withHeadersIncludeMemberToken: any;

  const ctx = initE2ETest(async ({ module, req }) => {
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    postRepository = module.get<Repository<PostEntity>>(
      getRepositoryToken(PostEntity),
    );

    memberTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.MEMBER,
    );
    withHeadersIncludeMemberToken = withHeadersBy(memberTokenHeaders);
  });

  describe('DELETE /posts/:id', () => {
    const rootApiPath = '/posts';

    it('success - delete post by id (200)', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        ctx.req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req.delete(`${rootApiPath}/${post.id}`),
      ).expect(200);

      // then
      const body = res.body;
      expectPostResponseSucceed(body);
    });

    it('failed - not found user entity (404)', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        ctx.req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;
      const nonExistentId = 2 ** 31 - 1;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req.delete(`${rootApiPath}/${nonExistentId}`),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });

    it('failed - access id denied (403)', async () => {
      // given
      const user: Partial<UserEntity> = await createUser(userRepository);

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req.delete(`${rootApiPath}/${post.id}`),
      ).expect(403);

      // then
      expectResponseFailed(res);
    });
  });
});
