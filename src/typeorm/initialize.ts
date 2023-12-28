import { serverConfig } from 'src/config';
import { DataSource } from 'typeorm';

export const initializeData = async (instance: DataSource) => {
  if (serverConfig.nodeEnv !== 'prod') {
    await instance.dropDatabase();
    await instance.destroy();
    await instance.initialize();
  }
};
