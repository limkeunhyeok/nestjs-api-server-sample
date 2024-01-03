import { FindOptionsOrderValue, FindOptionsWhere } from 'typeorm';
import { Role, UserEntity } from './user.entity';

export interface UserInfo {
  email: string;
  password: string;
  role: Role;
}

export interface UserQuery extends Pick<FindOptionsWhere<UserEntity>, 'role'> {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  sortingField?: string;
  sortingDirection?: FindOptionsOrderValue;
}
