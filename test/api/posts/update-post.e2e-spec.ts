import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/constants/role.const';
import { PostEntity } from 'src/modules/posts/entities/post.entity';
import { UserEntity } from 'src/modules/users/user.entity';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { expectResponseFailed } from 'test/expectation/common';
import { expectPostResponseSucceed } from 'test/expectation/post';
import { createTestApp } from 'test/lib/create-test-app';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { createPost, mockPostRaw } from 'test/mockup/post';
import { createUser } from 'test/mockup/user';
import { Repository } from 'typeorm';

describe('Post API Test', () => {
  let app: INestApplication;
  let module: TestingModule;

  let userRepository: Repository<UserEntity>;
  let postRepository: Repository<PostEntity>;

  let req: TestAgent;

  let memberTokenHeaders: any;
  let withHeadersIncludeMemberToken: any;

  beforeAll(async () => {
    const result = await createTestApp();

    app = result.app;
    module = result.module;

    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    postRepository = module.get<Repository<PostEntity>>(
      getRepositoryToken(PostEntity),
    );

    await app.init();

    req = request(app.getHttpServer());

    memberTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.MEMBER,
    );
    withHeadersIncludeMemberToken = withHeadersBy(memberTokenHeaders);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PUT /posts/:id', () => {
    const rootApiPath = '/posts';

    it('should success update post successfully and return 200', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const newPostRaw = mockPostRaw(user);
      const params = {
        title: newPostRaw.title,
        contents: newPostRaw.contents,
        published: newPostRaw.published,
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        req.put(`${rootApiPath}/${post.id}`).send(params),
      ).expect(200);

      // then
      const body = res.body;
      expectPostResponseSucceed(body, params);
    });

    it('should return 400 when title is invalid', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const newPostRaw = mockPostRaw(user);
      const params = {
        title: 'a'.repeat(101),
        contents: newPostRaw.contents,
        published: newPostRaw.published,
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        req.put(`${rootApiPath}/${post.id}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 400 when published is invalid', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const newPostRaw = mockPostRaw(user);
      const params = {
        title: newPostRaw.title,
        contents: newPostRaw.contents,
        published: 'EXAMPLE',
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        req.put(`${rootApiPath}/${post.id}`).send(params),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('should return 404 when post is not found', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const newPostRaw = mockPostRaw(user);
      const params = {
        title: newPostRaw.title,
        contents: newPostRaw.contents,
        published: newPostRaw.published,
      };
      const nonExistentId = 2 ** 31 - 1;

      // when
      const res = await withHeadersIncludeMemberToken(
        req.put(`${rootApiPath}/${nonExistentId}`).send(params),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });

    it('should return 403 when user is not allowed to update the post', async () => {
      // given
      const user: Partial<UserEntity> = await createUser(userRepository);

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const newPostRaw = mockPostRaw(user);
      const params = {
        title: newPostRaw.title,
        contents: newPostRaw.contents,
        published: newPostRaw.published,
      };

      // when
      const res = await withHeadersIncludeMemberToken(
        req.put(`${rootApiPath}/${post.id}`).send(params),
      ).expect(403);

      // then
      expectResponseFailed(res);
    });
  });
});
