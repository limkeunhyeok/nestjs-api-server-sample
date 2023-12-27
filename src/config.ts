import { config } from 'dotenv';
import * as path from 'path';

const { error } = config({
  path: path.resolve(`.env.${process.env.NODE_ENV || 'dev'}`),
});

if (error) {
  console.error({
    message: `Not found .env file for ${process.env.NODE_ENV}.`,
    category: 'initializer',
  });
}

class ServerConfig {
  nodeEnv = process.env.NODE_ENV || 'dev';
  port = Number(process.env.PORT) || '3000';

  dbName = process.env.DB_NAME || `server-${process.env.NODE_ENV}`;
  dbPort = Number(process.env.DB_PORT) || 5433;
  dbHost = process.env.DB_HOST || 'localhost';
  dbUser = process.env.DB_USER || 'root';
  dbPass = process.env.DB_PASS || 'password';
}

export const serverConfig = new ServerConfig();
