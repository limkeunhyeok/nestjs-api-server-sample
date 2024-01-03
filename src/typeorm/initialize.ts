import * as bcrypt from 'bcrypt';
import { serverConfig } from 'src/config';
import { Role, UserEntity } from 'src/modules/users/user.entity';
import { DataSource } from 'typeorm';

export const initializeData = async (instance: DataSource) => {
  if (serverConfig.nodeEnv !== 'prod') {
    await instance.dropDatabase();
    await instance.destroy();
    await instance.initialize();
  }

  await instance.manager.transaction(async (manager) => {
    const isExistAdmin = await manager.findOneBy(UserEntity, {
      email: 'admin@example.com',
    });

    if (!isExistAdmin) {
      const userEntity = new UserEntity();

      userEntity.email = 'admin@example.com';
      userEntity.password = bcrypt.hashSync('password', 10);
      userEntity.role = Role.ADMIN;
      userEntity.latestTryLoginDate = new Date();

      await manager.save(UserEntity, userEntity);
    }
  });
};
