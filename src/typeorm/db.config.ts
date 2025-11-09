import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ServerEnv } from 'src/configurations/server.config';
import { EntitySchema, MixedList } from 'typeorm';

// entities: MixedList<Function | string | EntitySchema>
export const getDbConfig = (
  configService: ConfigService<ServerEnv, true>,
  entities: MixedList<Function | string | EntitySchema>,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASS'),
    synchronize:
      configService.get('NODE_ENV') === 'prod' ||
      configService.get('NODE_ENV') === 'test'
        ? false
        : true,
    logging:
      configService.get('NODE_ENV') === 'prod' ||
      configService.get('NODE_ENV') === 'test'
        ? false
        : true,
    entities,
    // migrationsRun: true,
    // migrations: [__dirname + '/**/migrations/*{.ts,.js}'],
    // metadataTableName: 'migrations',
  };
};
