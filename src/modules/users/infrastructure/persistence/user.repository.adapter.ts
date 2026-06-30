import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { UserRepositoryPort } from '../../domain/repository-ports/user.repository.port';
import { UserEntity } from './user.orm-entity';
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

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return await this.repo.findOneBy({ email });
  }

  async findOneById(id: number): Promise<UserEntity | null> {
    return await this.repo.findOneBy({ id });
  }

  async save(user: Partial<UserEntity>): Promise<UserEntity> {
    return await this.repo.save(user);
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
  }): Promise<PaginationResponse<UserEntity>> {
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

    return toPaginationResponse({ total, limit, offset, data: users });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
