import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { ServerEnv } from 'src/configurations/server.config';
import { removeUndefined } from 'src/libs/object';
import { PagingResponse, pagingResponse } from 'src/libs/paging';
import { getDateRange } from 'src/libs/range';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Role, UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService<ServerEnv, true>,
  ) {}

  @Transactional()
  async createUser(params: {
    email: string;
    password: string;
    name: string;
    role: Role;
  }): Promise<UserEntity> {
    const hasUser = await this.userRepository.findOneBy({
      email: params.email,
    });

    if (hasUser) {
      throw new BadRequestException('Email is already exists.');
    }

    const hash = await bcrypt.hash(
      params.password,
      this.configService.get<number>('SALT_ROUND'),
    );

    const createdUser = this.userRepository.create({
      email: params.email,
      password: hash,
      role: params.role,
      name: params.name,
    });

    return await this.userRepository.save(createdUser);
  }

  @Transactional()
  async paginateUsers(params: {
    role?: Role;
    name?: string;
    startDate?: Date;
    endDate?: Date;
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PagingResponse<UserEntity>> {
    const {
      role,
      name,
      startDate,
      endDate,
      limit,
      offset,
      sortField,
      sortDirection,
    } = params;

    const query: FindOptionsWhere<UserEntity> = {};

    const range = getDateRange(startDate, endDate);

    if (params.role) {
      query.role = role;
    }

    if (params.name) {
      query.name = Like(`%${name}%`);
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: {
        ...query,
        ...range,
      },
      order: {
        [sortField]: sortDirection,
      },
      skip: limit > 0 ? offset : undefined,
      take: limit > 0 ? limit : undefined,
    });

    return pagingResponse({ total, limit, offset, data: users });
  }

  @Transactional()
  async getUserById(userId: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('Not found user entity.');
    }

    return user;
  }

  @Transactional()
  async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('Not found user entity.');
    }

    return user;
  }

  @Transactional()
  async updateUser(
    userId: number,
    params: {
      password?: string;
      name?: string;
      role?: Role;
    },
    userInToken: {
      userId: number;
      role: Role;
    },
  ): Promise<UserEntity> {
    const user = await this.getUserById(userId);

    if (userInToken.role !== Role.ADMIN && userInToken.userId !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to modify this resource.',
      );
    }

    const updateFields = removeUndefined(params);

    if (updateFields.password) {
      const hash = await bcrypt.hash(
        updateFields.password,
        this.configService.get<number>('SALT_ROUND'),
      );

      updateFields.password = hash;
    }

    Object.assign(user, updateFields);

    return await this.userRepository.save(user);
  }

  @Transactional()
  async deleteUser(
    userId: number,
    userInToken: {
      userId: number;
      role: Role;
    },
  ): Promise<UserEntity> {
    const user = await this.getUserById(userId);

    if (userInToken.role !== Role.ADMIN && userInToken.userId !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to modify this resource.',
      );
    }

    return await this.userRepository.remove(user);
  }
}
