import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  EMAIL_IS_ALREADY_REGISTERED,
  FORBIDDEN_RESOURCE_MODIFICATION,
  NOT_FOUND_RESOURCE,
} from 'src/common/constants/exception-message.const';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { ServerEnv } from 'src/configurations/server.config';
import { removeUndefined } from 'src/libs/object';
import { PagingResponse, pagingResponse } from 'src/libs/paging';
import { getDateRange } from 'src/libs/range';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Role } from '../../common/constants/role.const';
import { UserEntity } from './user.entity';

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
      throw new BadRequestException(EMAIL_IS_ALREADY_REGISTERED);
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

    if (role) {
      query.role = role;
    }

    if (name) {
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
      throw new NotFoundException(NOT_FOUND_RESOURCE);
    }

    return user;
  }

  @Transactional()
  async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(NOT_FOUND_RESOURCE);
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
      sub: number;
      role: Role;
    },
  ): Promise<UserEntity> {
    const user = await this.getUserById(userId);

    if (userInToken.role !== Role.ADMIN && userInToken.sub !== user.id) {
      throw new ForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
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
      sub: number;
      role: Role;
    },
  ): Promise<UserEntity> {
    const user = await this.getUserById(userId);

    if (userInToken.role !== Role.ADMIN && userInToken.sub !== user.id) {
      throw new ForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    const deletedUser = { ...user };

    await this.userRepository.remove(user); // remove 시, id에 undefined가 할당

    return deletedUser;
  }

  async resetUserPassword(params: {
    userId: number;
    newPassword: string;
  }): Promise<UserEntity> {
    const { userId, newPassword } = params;

    const user = await this.getUserById(userId);

    const hash = await bcrypt.hash(
      newPassword,
      this.configService.get<number>('SALT_ROUND'),
    );

    user.password = hash;
    return await this.userRepository.save(user);
  }
}
