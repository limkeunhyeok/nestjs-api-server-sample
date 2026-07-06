import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'src/common/databases/snake-naming.strategy';
import { ServerEnv } from 'src/configurations/server.config';
import { DevTokenEntity } from 'src/modules/auth/dev-token.entity';
import { CommentEntity } from 'src/modules/posts/infrastructure/persistence/comment.orm-entity';
import { PostEntity } from 'src/modules/posts/infrastructure/persistence/post.orm-entity';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/entities/user.orm-entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService<ServerEnv, true>) {}

  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'postgres',
      database: this.configService.get<string>('DB_NAME'),
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASS'),
      synchronize: true,
      logging: false,
      entities: [UserEntity, PostEntity, CommentEntity, DevTokenEntity],
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}
