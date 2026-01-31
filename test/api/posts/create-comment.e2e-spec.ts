import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/constants/role.const';
import { CommentEntity } from 'src/modules/posts/entities/comment.entity';
import { PostEntity } from 'src/modules/posts/entities/post.entity';
import { UserEntity } from 'src/modules/users/user.entity';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { expectCommentResponseSucceed } from 'test/expectation/comment';
import { expectResponseFailed } from 'test/expectation/common';
import { createTestApp } from 'test/lib/create-test-app';
import { TestService } from 'test/lib/test.service';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { mockCreateCommentDto } from 'test/mockup/comment';
import { createPost, mockPostRaw } from 'test/mockup/post';
import { Repository } from 'typeorm';

const globalAny: any = global;

describe('Comment API Test', () => {
  let app: INestApplication;
  let module: TestingModule;

  let userRepository: Repository<UserEntity>;
  let postRepository: Repository<PostEntity>;
  let commentRepository: Repository<CommentEntity>;

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
    commentRepository = module.get<Repository<CommentEntity>>(
      getRepositoryToken(CommentEntity),
    );

    await app.init();
    globalAny.testApp = app;

    req = request(app.getHttpServer());

    memberTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.MEMBER,
    );
    withHeadersIncludeMemberToken = withHeadersBy(memberTokenHeaders);
  });

  afterAll(async () => {
    const testService = globalAny.testApp.get(TestService);
    await testService.cleanDatabase();

    console.log('Closing NestJS application...');
    if (globalAny.testApp) {
      await globalAny.testApp.close();
      delete globalAny.testApp;
    }
    console.log('NestJS application closed.');
  });

  describe('POST /posts/:postId/comments', () => {
    const rootApiPath = '/posts';

    it('success create comment successfully and return 201', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = mockCreateCommentDto();

      // when
      const res = await withHeadersIncludeMemberToken(
        req.post(`${rootApiPath}/${post.id}/comments`).send(params),
      ).expect(201);

      // then
      const body = res.body;
      expectCommentResponseSucceed(body, params);
    });

    it('should return 400 when contents is missing', async () => {
      // given
      const authResult = await withHeadersIncludeMemberToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const params = mockCreateCommentDto();

      params.contents = undefined as any;

      // when
      const res = await withHeadersIncludeMemberToken(
        req.post(`${rootApiPath}/${post.id}/comments`).send(params),
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

      const params = mockCreateCommentDto();
      const published = 'TRUE';

      // when
      const res = await withHeadersIncludeMemberToken(
        req
          .post(`${rootApiPath}/${post.id}/comments`)
          .send({ ...params, published }),
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

      const params = mockCreateCommentDto();
      const nonExistentId = 2 ** 31 - 1;

      // when
      const res = await withHeadersIncludeMemberToken(
        req.post(`${rootApiPath}/${nonExistentId}/comments`).send(params),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });
  });
});
