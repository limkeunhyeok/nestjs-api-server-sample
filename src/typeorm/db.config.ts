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
    synchronize: serverConfig.nodeEnv !== 'prod' ? true : false,
    logging: serverConfig.nodeEnv !== 'prod' ? true : false,
    entities,
  };
};
