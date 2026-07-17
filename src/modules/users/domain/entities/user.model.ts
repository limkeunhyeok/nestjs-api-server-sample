import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { Role } from 'src/common/constants/role.const';

export class User {
  constructor(
    public readonly id: number,
    private _email: Email,
    private _password: Password,
    private _name: string,
    private _role: Role,
    public readonly latestTryLoginDate?: Date | null,
    public readonly version?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  get email(): string {
    return this._email.value;
  }

  get passwordHash(): string {
    return this._password.hash;
  }

  get name(): string {
    return this._name;
  }

  get role(): Role {
    return this._role;
  }

  changeName(newName: string) {
    if (!newName || newName.trim().length === 0) {
      throw new Error('이름이 유효하지 않습니다.');
    }
    this._name = newName;
  }

  updatePassword(newPassword: Password) {
    this._password = newPassword;
  }

  changeRole(newRole: Role) {
    this._role = newRole;
  }
}
