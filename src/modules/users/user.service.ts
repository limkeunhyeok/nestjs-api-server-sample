import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { serverConfig } from 'src/config';
import { pagingResponse } from 'src/libs/paging';
import { getDateRange } from 'src/libs/range';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { UserEntity } from './user.entity';
import { UserQuery } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  @Transactional()
  async create(
    userInfo: Pick<UserEntity, 'email' | 'password' | 'role'>,
  ): Promise<Omit<UserEntity, 'password'>> {
    const hasUser = await this.userRepository.findOneBy({
      email: userInfo.email,
    });

    if (hasUser) {
      throw new BadRequestException('Email is already exists.');
    }

    const userEntity = await this.userRepository.save(
      this.generateEntity(userInfo),
    );
    return this.toJson(userEntity);
  }

  @Transactional()
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

    const range = getDateRange(startDate, endDate);

    const [userEntities, total] = await this.userRepository.findAndCount({
      where: {
        ...range,
        ...userInfo,
      },
      skip: offset,
      take: limit,
      order: { [sortingField]: sortingDirection },
    });

    const users = userEntities.map((userEntity) => this.toJson(userEntity));

    return pagingResponse({ total, limit, offset, data: users });
  }

  @Transactional()
  async getById(id: number) {
    const userEntity = await this.userRepository.findOneBy({ id });

    if (!userEntity) {
      throw new NotFoundException('Not found user entity.');
    }

    return this.toJson(userEntity);
  }

  @Transactional()
  async updateById(id: number, userInfo: Partial<UserEntity>) {
    let userEntity = await this.userRepository.findOneBy({ id });

    if (!userEntity) {
      throw new NotFoundException('Not found user entity.');
    }

    userEntity = await this.userRepository.save({ ...userEntity, ...userInfo });

    return this.toJson(userEntity);
  }

  @Transactional()
  async deleteById(id: number) {
    const userEntity = await this.userRepository.findOneBy({ id });

    if (!userEntity) {
      throw new NotFoundException('Not found user entity.');
    }

    await this.userRepository.remove(userEntity);

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
