import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { serverConfig } from 'src/config';
import { pagingResponse } from 'src/libs/paging';
import { getDateRange } from 'src/libs/range';
import { DataSource } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserQuery } from './user.interface';

@Injectable()
export class UserService {
  constructor(private readonly datasource: DataSource) {}

  async create(
    userInfo: Pick<UserEntity, 'email' | 'password' | 'role'>,
  ): Promise<Omit<UserEntity, 'password'>> {
    const user = await this.datasource.manager.transaction(async (manager) => {
      const hasUser = await manager.findOneBy(UserEntity, {
        email: userInfo.email,
      });

      if (hasUser) {
        throw new BadRequestException('Email is already exists.');
      }

      const userEntity = this.generateEntity(userInfo);
      return await manager.save(UserEntity, userEntity);
    });

    return this.toJson(user);
  }

  async getByQuery(query: UserQuery) {
    const {
      startDate,
      endDate,
      limit,
      offset,
      sortingField,
      sortingDirection,
      ...userInfo
    } = query;

    const [users, total] = await this.datasource.manager.transaction(
      async (manager) => {
        const range = getDateRange(startDate, endDate);

        const [userEntities, total] = await manager.findAndCount(UserEntity, {
          where: {
            ...range,
            ...userInfo,
          },
          skip: offset,
          take: limit,
          order: { [sortingField]: sortingDirection },
        });

        const users = userEntities.map((uesrEntity) => this.toJson(uesrEntity));
        return [users, total];
      },
    );
    return pagingResponse({ total, limit, offset, data: users });
  }

  async getById(id: number) {
    const userEntity = await this.datasource.manager.transaction(
      async (manager) => {
        return manager.findOneBy(UserEntity, { id });
      },
    );

    if (!userEntity) {
      throw new NotFoundException('Not found user entity.');
    }
    return this.toJson(userEntity);
  }

  async updateById(id: number, userInfo: Partial<UserEntity>) {
    const userEntity = await this.datasource.manager.transaction(
      async (manager) => {
        const userEntity = await manager.findOneBy(UserEntity, { id });

        if (!userEntity) {
          throw new NotFoundException('Not found user entity.');
        }

        return await manager.save(UserEntity, { ...userEntity, ...userInfo });
      },
    );

    return this.toJson(userEntity);
  }

  async deleteById(id: number) {
    const userEntity = await this.datasource.manager.transaction(
      async (manager) => {
        const userEntity = await manager.findOneBy(UserEntity, { id });

        if (!userEntity) {
          throw new NotFoundException('Not found user entity.');
        }

        return await manager.remove(UserEntity, userEntity);
      },
    );

    return this.toJson({ ...userEntity, id });
  }

  private generateEntity(
    userInfo: Pick<UserEntity, 'email' | 'password' | 'role'>,
  ) {
    const userEntity = new UserEntity();

    userEntity.email = userInfo.email;
    userEntity.password = bcrypt.hashSync(
      userInfo.password,
      serverConfig.saltRound,
    );
    userEntity.role = userInfo.role;
    userEntity.latestTryLoginDate = new Date();
    return userEntity;
  }

  private toJson(userEntity: UserEntity) {
    const { password, ...userJson } = { ...userEntity };

    return userJson;
  }
}
