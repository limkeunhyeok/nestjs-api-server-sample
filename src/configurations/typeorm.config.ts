import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'src/common/databases/snake-naming.strategy';
import { DevTokenEntity } from 'src/modules/auth/dev-token.entity';
import { CommentEntity } from 'src/modules/posts/entities/comment.entity';
import { PostEntity } from 'src/modules/posts/entities/post.entity';
import { UserEntity } from 'src/modules/users/user.entity';
import { NodeEnv, ServerEnv } from './server.config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService<ServerEnv, true>) {}

  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const nodeEnv = this.configService.get<NodeEnv>('NODE_ENV');

    return {
      type: 'postgres',
      database: this.configService.get<string>('DB_NAME'),
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASS'),
      synchronize: nodeEnv === NodeEnv.DEV ? true : false,
      logging: nodeEnv === NodeEnv.DEV ? true : false,
      entities: [UserEntity, PostEntity, CommentEntity, DevTokenEntity],
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}