import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { serverConfig } from 'src/config';
import { EntitySchema, MixedList } from 'typeorm';

// entities: MixedList<Function | string | EntitySchema>
export const getDbConfig = (
  entities: MixedList<Function | string | EntitySchema>,
): TypeOrmModuleOptions => {
  return {
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
    entities,
    // migrationsRun: true,
    // migrations: [__dirname + '/**/migrations/*{.ts,.js}'],
    // metadataTableName: 'migrations',
  };
};
