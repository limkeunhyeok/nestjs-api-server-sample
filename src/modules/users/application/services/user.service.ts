import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  buildUserByIdCacheKey,
  buildUsersPaginationCacheKey,
} from 'src/common/cache/user.cache-key';
import {
  EMAIL_IS_ALREADY_REGISTERED,
  FORBIDDEN_RESOURCE_MODIFICATION,
  NOT_FOUND_RESOURCE,
} from 'src/common/constants/exception-message.const';
import { Role } from 'src/common/constants/role.const';
import { CacheEvict } from 'src/common/decorators/cache-evict.decorator';
import { Cacheable } from 'src/common/decorators/cacheable.decorator';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { ServerEnv } from 'src/configurations/server.config';
import { removeUndefined } from 'src/libs/object';
import { User } from 'src/modules/users/domain/entities/user.model';
import {
  EmailAlreadyRegisteredException,
  UserForbiddenException,
  UserNotFoundException,
} from 'src/modules/users/domain/exceptions/user.exception';
import {
  USER_REPOSITORY_PORT,
  UserRepositoryPort,
} from 'src/modules/users/domain/repositories/user.repository.port';
import { Email } from 'src/modules/users/domain/value-objects/email.vo';
import { Password } from 'src/modules/users/domain/value-objects/password.vo';
import { getTTL } from 'src/modules/users/utils/user.util';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
    private readonly configService: ConfigService<ServerEnv, true>,
  ) {}

  @CacheEvict({ keysSetName: 'cacheKeys' })
  @Transactional()
  async createUser(params: {
    email: string;
    password: string;
    name: string;
    role: Role;
  }): Promise<User> {
    const hasUser = await this.userRepository.findOneByEmail(params.email);

    if (hasUser) {
      throw new EmailAlreadyRegisteredException(EMAIL_IS_ALREADY_REGISTERED);
    }

    Password.validateRawPassword(params.password);

    const hash = await bcrypt.hash(
      params.password,
      this.configService.get<number>('SALT_ROUND'),
    );

    const user = new User(
      0,
      new Email(params.email),
      new Password(hash),
      params.name,
      params.role,
    );

    return await this.userRepository.save(user);
  }

  @Cacheable({
    keyGenerator: (params) => buildUsersPaginationCacheKey(params),
    ttl: (params) => getTTL(params),
  })
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
  }): Promise<PaginationResponse<User>> {
    return await this.userRepository.paginate(params);
  }

  @Cacheable<[number]>({
    keyGenerator: (userId: number) => buildUserByIdCacheKey(userId),
    ttl: 3600000, // 1시간
    trackKeys: true,
    keysSetName: 'cacheKeys',
  })
  @Transactional()
  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOneById(userId);

    if (!user) {
      throw new UserNotFoundException(NOT_FOUND_RESOURCE);
    }

    return user;
  }

  @Transactional()
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneByEmail(email);
    if (!user) {
      throw new UserNotFoundException(NOT_FOUND_RESOURCE);
    }

    return user;
  }

  @CacheEvict({ keysSetName: 'cacheKeys' })
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
  ): Promise<User> {
    const user = await this.userRepository.findOneById(userId);

    if (!user) {
      throw new UserNotFoundException(NOT_FOUND_RESOURCE);
    }

    if (userInToken.role !== Role.ADMIN && userInToken.sub !== user.id) {
      throw new UserForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    const updateFields = removeUndefined(params);

    if (updateFields.password) {
      Password.validateRawPassword(updateFields.password);

      const hash = await bcrypt.hash(
        updateFields.password,
        this.configService.get<number>('SALT_ROUND'),
      );

      user.updatePassword(new Password(hash));
    }

    if (updateFields.name) {
      user.changeName(updateFields.name);
    }

    if (updateFields.role) {
      user.changeRole(updateFields.role);
    }

    return await this.userRepository.save(user);
  }

  @CacheEvict({ keysSetName: 'cacheKeys' })
  @Transactional()
  async deleteUser(
    userId: number,
    userInToken: {
      sub: number;
      role: Role;
    },
  ): Promise<User> {
    const user = await this.userRepository.findOneById(userId);

    if (!user) {
      throw new UserNotFoundException(NOT_FOUND_RESOURCE);
    }

    if (userInToken.role !== Role.ADMIN && userInToken.sub !== user.id) {
      throw new UserForbiddenException(FORBIDDEN_RESOURCE_MODIFICATION);
    }

    await this.userRepository.delete(user.id);

    return user;
  }

  async resetUserPassword(params: {
    userId: number;
    newPassword: string;
  }): Promise<User> {
    const { userId, newPassword } = params;

    const user = await this.userRepository.findOneById(userId);

    if (!user) {
      throw new UserNotFoundException(NOT_FOUND_RESOURCE);
    }

    Password.validateRawPassword(newPassword);

    const hash = await bcrypt.hash(
      newPassword,
      this.configService.get<number>('SALT_ROUND'),
    );

    user.updatePassword(new Password(hash));
    return await this.userRepository.save(user);
  }
}
