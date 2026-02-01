import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/constants/role.const';
import { CommentEntity } from 'src/modules/posts/entities/comment.entity';
import { PostEntity } from 'src/modules/posts/entities/post.entity';
import { UserEntity } from 'src/modules/users/user.entity';
import { expectCommentResponseSucceed } from 'test/expectation/comment';
import { expectResponseFailed } from 'test/expectation/common';
import { initE2ETest } from 'test/lib/init-e2e-test';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { createComment, mockCommentRaw } from 'test/mockup/comment';
import { createPost, mockPostRaw } from 'test/mockup/post';
import { createUser } from 'test/mockup/user';
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

  describe('PUT /posts/:postId/comments/:commentId', () => {
    const rootApiPath = '/posts';

    it('should success update comment successfully and return 201', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        ctx.req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const commentRaw = mockCommentRaw(user, post);
      const comment = await createComment(commentRepository, commentRaw);

      const newCommentRaw = mockCommentRaw(user, post);
      const params = {
        contents: newCommentRaw.contents,
        published: newCommentRaw.published,
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req
          .put(`${rootApiPath}/${post.id}/comments/${comment.id}`)
          .send(params),
      ).expect(200);

      // then
      const body = res.body;
      expectCommentResponseSucceed(body, params);
    });

    it('should return 400 when published is invalid', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        ctx.req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const commentRaw = mockCommentRaw(user, post);
      const comment = await createComment(commentRepository, commentRaw);

      const newCommentRaw = mockCommentRaw(user, post);
      const params = {
        contents: newCommentRaw.contents,
        published: 'EXAMPLE',
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req
          .put(`${rootApiPath}/${post.id}/comments/${comment.id}`)
          .send(params),
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

      const commentRaw = mockCommentRaw(user, post);
      const comment = await createComment(commentRepository, commentRaw);

      const newCommentRaw = mockCommentRaw(user, post);
      const params = {
        contents: newCommentRaw.contents,
        published: newCommentRaw.published,
      };
      const nonExistentId = 2 ** 31 - 1;

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req
          .put(`${rootApiPath}/${nonExistentId}/comments/${comment.id}`)
          .send(params),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });

    it('should return 409 when comment does not belong to the post', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        ctx.req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const commentRaw = mockCommentRaw(user, post);
      const comment = await createComment(commentRepository, commentRaw);

      const newCommentRaw = mockCommentRaw(user, post);
      const params = {
        contents: newCommentRaw.contents,
        published: newCommentRaw.published,
      };

      const newPostRaw = mockPostRaw(user);
      const newPost = await createPost(postRepository, newPostRaw);

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req
          .put(`${rootApiPath}/${newPost.id}/comments/${comment.id}`)
          .send(params),
      ).expect(409);

      // then
      expectResponseFailed(res);
    });

    it('should return 404 when comment is not found', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        ctx.req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const commentRaw = mockCommentRaw(user, post);
      const comment = await createComment(commentRepository, commentRaw);

      const newCommentRaw = mockCommentRaw(user, post);
      const params = {
        contents: newCommentRaw.contents,
        published: newCommentRaw.published,
      };
      const nonExistentId = 2 ** 31 - 1;

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req
          .put(`${rootApiPath}/${post.id}/comments/${nonExistentId}`)
          .send(params),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });

    it('should return 403 when user is not allowed to update the comment', async () => {
      // given
      const user: Partial<UserEntity> = await createUser(userRepository);

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const commentRaw = mockCommentRaw(user, post);
      const comment = await createComment(commentRepository, commentRaw);

      const params = {
        contents: commentRaw.contents,
        published: commentRaw.published,
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        ctx.req
          .put(`${rootApiPath}/${post.id}/comments/${comment.id}`)
          .send(params),
      ).expect(403);

      // then
      expectResponseFailed(res);
    });
  });
});
