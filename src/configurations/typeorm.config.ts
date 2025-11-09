import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'src/common/databases/snake-naming.strategy';
import { CommentEntity } from 'src/modules/comments/comment.entity';
import { PostEntity } from 'src/modules/posts/post.entity';
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
      synchronize: false, // nodeEnv === NodeEnv.PROD ? false : true,
      logging: nodeEnv === NodeEnv.PROD ? false : true,
      entities: [UserEntity, PostEntity, CommentEntity],
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}