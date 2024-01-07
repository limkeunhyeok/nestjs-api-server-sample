import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { serverConfig } from 'src/config';

// entities: MixedList<Function | string | EntitySchema>
export const getDbConfig = (entities: any): TypeOrmModuleOptions => {
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
  };
};
