import { DataSource } from 'typeorm';
import { serverConfig } from './src/config';
import { CommentEntity } from './src/modules/comments/comment.entity';
import { PostEntity } from './src/modules/posts/post.entity';
import { UserEntity } from './src/modules/users/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: serverConfig.dbHost,
  port: serverConfig.dbPort,
  database: serverConfig.dbName,
  username: serverConfig.dbUser,
  password: serverConfig.dbPass,
  synchronize:
    serverConfig.nodeEnv === 'prod' || serverConfig.nodeEnv === 'test'
      ? false
      : true,
  logging:
    serverConfig.nodeEnv === 'prod' || serverConfig.nodeEnv === 'test'
      ? false
      : true,
  entities: [UserEntity, PostEntity, CommentEntity],
  migrations: [__dirname + '/**/migrations/*{.ts,.js}'],
  metadataTableName: 'migrations',
});
