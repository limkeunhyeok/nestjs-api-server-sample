import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { HealthCheckModule } from 'src/common/health-check/health-check.module';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';
import { DtoValidationPipe } from 'src/common/pipes/dto-validation.pipe';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CommentEntity } from 'src/modules/comments/comment.entity';
import { CommentModule } from 'src/modules/comments/comment.module';
import { PostEntity } from 'src/modules/posts/post.entity';
import { PostModule } from 'src/modules/posts/post.module';
import { Role, UserEntity } from 'src/modules/users/user.entity';
import { UserModule } from 'src/modules/users/user.module';
import { getDbConfig } from 'src/typeorm/db.config';
import * as request from 'supertest';
import { expectCommentResponseSucceed } from 'test/expectation/comment';
import { expectResponseFailed } from 'test/expectation/common';
import { fetchUserTokenAndHeaders, withHeadersBy } from 'test/lib/utils';
import { createComment, mockCommentRaw } from 'test/mockup/comment';
import { createPost, mockPostRaw } from 'test/mockup/post';
import { DataSource, Repository } from 'typeorm';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';

@Module({
  imports: [
    HealthCheckModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      useFactory() {
        return getDbConfig([UserEntity, PostEntity, CommentEntity]);
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed.');
        }
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    UserModule,
    PostModule,
    CommentModule,
  ],
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/posts/*/comments/*', method: RequestMethod.GET },
        { path: '/auth/me', method: RequestMethod.GET },
      );
  }
}

describe('Comment API Test', () => {
  let app: INestApplication;
  let req: request.SuperTest<request.Test>;

  let testingModule: TestingModule;
  let userRepository: Repository<UserEntity>;
  let postRepository: Repository<PostEntity>;
  let commentRepository: Repository<CommentEntity>;

  let adminTokenHeaders: any;
  let withHeadersIncludeAdminToken: any;

  initializeTransactionalContext();

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = testingModule.createNestApplication();

    app.useGlobalPipes(new DtoValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();

    userRepository = testingModule.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    postRepository = testingModule.get<Repository<PostEntity>>(
      getRepositoryToken(PostEntity),
    );
    commentRepository = testingModule.get<Repository<CommentEntity>>(
      getRepositoryToken(CommentEntity),
    );

    req = request(app.getHttpServer());

    adminTokenHeaders = await fetchUserTokenAndHeaders(
      req,
      userRepository,
      Role.ADMIN,
    );
    withHeadersIncludeAdminToken = withHeadersBy(adminTokenHeaders);
  });

  afterAll(async () => {
    await postRepository.delete({});
    await userRepository.delete({});
    await commentRepository.delete({});

    await app.close();
  });

  describe('GET /posts/:postId/comments/:commentId', () => {
    const rootApiPath = '/posts';

    it('success - get comment by id (200)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const commentRaw = mockCommentRaw(user, post);
      const comment = await createComment(commentRepository, commentRaw);

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}/${post.id}/comments/${comment.id}`),
      ).expect(200);

      // then
      const body = res.body;
      expectCommentResponseSucceed(body, comment);
    });

    it('failed - not found post entity (404)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const commentRaw = mockCommentRaw(user, post);
      const comment = await createComment(commentRepository, commentRaw);

      const nonExistentId = 2 ** 31 - 1;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}/${nonExistentId}/comments/${comment.id}`),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });

    it('failed - not match postId (409)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const commentRaw = mockCommentRaw(user, post);
      const comment = await createComment(commentRepository, commentRaw);

      const newPostRaw = mockPostRaw(user);
      const newPost = await createPost(postRepository, newPostRaw);

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}/${newPost.id}/comments/${comment.id}`),
      ).expect(409);

      // then
      expectResponseFailed(res);
    });

    it('failed - not found comment entity (404)', async () => {
      // given
      const authResult = await withHeadersIncludeAdminToken(
        req.get('/auth/me'),
      ).expect(200);

      const user: Partial<UserEntity> = authResult.body;

      const postRaw = mockPostRaw(user);
      const post = await createPost(postRepository, postRaw);

      const commentRaw = mockCommentRaw(user, post);
      const comment = await createComment(commentRepository, commentRaw);

      const nonExistentId = 2 ** 31 - 1;

      // when
      const res = await withHeadersIncludeAdminToken(
        req.get(`${rootApiPath}/${post.id}/comments/${nonExistentId}`),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });
  });
});
