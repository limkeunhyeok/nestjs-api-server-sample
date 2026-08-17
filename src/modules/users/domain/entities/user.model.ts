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

  static reconstitute(raw: unknown): User | null | undefined {
    if (!raw || typeof raw !== 'object') return raw as null | undefined;
    if (raw instanceof User) return raw;
    const r = raw as Record<string, unknown>;
    const emailObj = r._email as Record<string, unknown> | undefined;
    const emailVal =
      (typeof emailObj?.value === 'string' ? emailObj.value : undefined) ??
      (typeof r._email === 'string' ? r._email : undefined) ??
      (typeof r.email === 'string' ? r.email : '');
    const passwordObj = r._password as Record<string, unknown> | undefined;
    const passwordVal =
      (typeof passwordObj?._hash === 'string'
        ? passwordObj._hash
        : undefined) ??
      (typeof passwordObj?.hash === 'string' ? passwordObj.hash : undefined) ??
      (typeof r._password === 'string' ? r._password : undefined) ??
      (typeof r.passwordHash === 'string' ? r.passwordHash : undefined) ??
      (typeof r.password === 'string' ? r.password : '');
    const nameVal =
      (typeof r._name === 'string' ? r._name : undefined) ??
      (typeof r.name === 'string' ? r.name : '');
    const roleVal =
      (r._role as Role) ?? (r.role as Role) ?? (Role.MEMBER as Role);
    const latestTryLoginDate =
      r.latestTryLoginDate instanceof Date
        ? r.latestTryLoginDate
        : typeof r.latestTryLoginDate === 'string' ||
            typeof r.latestTryLoginDate === 'number'
          ? new Date(r.latestTryLoginDate)
          : null;
    const version = typeof r.version === 'number' ? r.version : undefined;
    const createdAt =
      r.createdAt instanceof Date
        ? r.createdAt
        : typeof r.createdAt === 'string' || typeof r.createdAt === 'number'
          ? new Date(r.createdAt)
          : undefined;
    const updatedAt =
      r.updatedAt instanceof Date
        ? r.updatedAt
        : typeof r.updatedAt === 'string' || typeof r.updatedAt === 'number'
          ? new Date(r.updatedAt)
          : undefined;

    return new User(
      typeof r.id === 'number' ? r.id : 0,
      new Email(emailVal),
      new Password(passwordVal),
      nameVal,
      roleVal,
      latestTryLoginDate,
      version,
      createdAt,
      updatedAt,
    );
  }
}
