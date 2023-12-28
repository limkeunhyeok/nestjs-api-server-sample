import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { serverConfig } from 'src/config';
import { EntitySchema, MixedList } from 'typeorm';

export const getDbConfig = (
  entities: MixedList<EntitySchema>,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: serverConfig.dbHost,
    port: serverConfig.dbPort,
    database: serverConfig.dbName,
    username: serverConfig.dbUser,
    password: serverConfig.dbPass,
    synchronize: serverConfig.nodeEnv !== 'prod' ? true : false,
    logging: serverConfig.nodeEnv !== 'prod' ? true : false,
    entities,
  };
};
