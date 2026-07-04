import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { UserRepositoryPort } from '../../domain/repository-ports/user.repository.port';
import { UserEntity } from './user.orm-entity';
import { User } from '../../domain/models/user.model';
import { UserMapper } from './user.mapper';
import { Role } from 'src/common/constants/role.const';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { getDateRange } from 'src/libs/range';
import { toPaginationResponse } from 'src/libs/pagination';

@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    const userEntity = await this.repo.findOneBy({ email });
    return userEntity ? UserMapper.toDomain(userEntity) : null;
  }

  async findOneById(id: number): Promise<User | null> {
    const userEntity = await this.repo.findOneBy({ id });
    return userEntity ? UserMapper.toDomain(userEntity) : null;
  }

  async save(user: User): Promise<User> {
    const ormEntity = UserMapper.toOrm(user);
    const savedEntity = await this.repo.save(ormEntity);
    return UserMapper.toDomain(savedEntity);
  }

  async paginate(params: {
    role?: Role;
    name?: string;
    startDate?: Date;
    endDate?: Date;
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PaginationResponse<User>> {
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

    const [users, total] = await this.repo.findAndCount({
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

    const domainUsers = users.map((user) => UserMapper.toDomain(user));

    return toPaginationResponse({ total, limit, offset, data: domainUsers });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
