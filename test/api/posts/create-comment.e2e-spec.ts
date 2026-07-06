import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/constants/role.const';
import { CommentEntity } from 'src/modules/posts/infrastructure/persistence/comment.orm-entity';
import { PostEntity } from 'src/modules/posts/infrastructure/persistence/post.orm-entity';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/entities/user.orm-entity';
import { expectCommentResponseSucceed } from 'test/expectation/comment';
import { expectResponseFailed } from 'test/expectation/common';
import { initE2ETest } from 'test/lib/init-e2e-test';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { mockCreateCommentDto } from 'test/mockup/comment';
import { createPost, mockPostRaw } from 'test/mockup/post';
import { Repository } from 'typeorm';

describe('Comment API Test', () => {
  let userRepository: Repository<UserEntity>;
  let postRepository: Repository<PostEntity>;
  let commentRepository: Repository<CommentEntity>;

  let memberTokenHeaders: any;
  let withHeadersIncludeMemberToken: any;

  const ctx = initE2ETest(async ({ module, req }) => {
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    postRepository = module.get<Repository<PostEntity>>(
      getRepositoryToken(PostEntity),
    );
    commentRepository = module.get<Repository<CommentEntity>>(
      getRepositoryToken(CommentEntity),
    );

    memberTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.MEMBER,
    );
    withHeadersIncludeMemberToken = withHeadersBy(memberTokenHeaders);
  });

  describe('POST /posts/:postId/comments', () => {
    const rootApiPath = '/posts';

    it('success create comment successfully and return 201', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        ctx.req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = mockCreateCommentDto();

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req.post(`${rootApiPath}/${post.id}/comments`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectCommentResponseSucceed(body, params);
    });

    it('should return 400 when contents is missing', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        ctx.req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = mockCreateCommentDto();

      params.contents = undefined as any;

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req.post(`${rootApiPath}/${post.id}/comments`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when published is invalid', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        ctx.req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = mockCreateCommentDto();
      const published = 'TRUE';

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req
          .post(`${rootApiPath}/${post.id}/comments`)
          .send({ ...params, published }),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 404 when post is not found', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        ctx.req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = mockCreateCommentDto();
      const nonExistentId = 2 ** 31 - 1;

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req.post(`${rootApiPath}/${nonExistentId}/comments`).send(params),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });
  });
});
