import { Role } from 'src/common/constants/role.const';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { UserEntity } from '../../infrastructure/persistence/user.orm-entity';

export interface UserRepositoryPort {
  findOneByEmail(email: string): Promise<UserEntity | null>;
  findOneById(id: number): Promise<UserEntity | null>;
  save(user: Partial<UserEntity>): Promise<UserEntity>;
  paginate(params: {
    role?: Role;
    name?: string;
    startDate?: Date;
    endDate?: Date;
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PaginationResponse<UserEntity>>;
  delete(id: number): Promise<void>;
}

export const USER_REPOSITORY_PORT = Symbol('UserRepositoryPort');
