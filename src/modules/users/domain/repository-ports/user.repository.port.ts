import { Role } from 'src/common/constants/role.const';
import { SortDirection } from 'src/common/dtos/paginate.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { User } from '../models/user.model';

export interface UserRepositoryPort {
  findOneByEmail(email: string): Promise<User | null>;
  findOneById(id: number): Promise<User | null>;
  save(user: User): Promise<User>;
  paginate(params: {
    role?: Role;
    name?: string;
    startDate?: Date;
    endDate?: Date;
    limit: number;
    offset: number;
    sortField: string;
    sortDirection: SortDirection;
  }): Promise<PaginationResponse<User>>;
  delete(id: number): Promise<void>;
}

export const USER_REPOSITORY_PORT = Symbol('UserRepositoryPort');
