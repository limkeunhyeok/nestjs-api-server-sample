import { Role } from 'src/common/constants/role.const';

export class DevToken {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly jti: string,
    public readonly role: Role,
    public readonly expiresAt: Date,
    public readonly createdBy: number,
    private _revokedAt: Date | null = null,
    public readonly version?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  get revokedAt(): Date | null {
    return this._revokedAt;
  }

  revoke(): void {
    this._revokedAt = new Date();
  }

  isRevoked(): boolean {
    return this._revokedAt !== null;
  }

  static reconstitute(raw: unknown): DevToken | null | undefined {
    if (!raw || typeof raw !== 'object') return raw as null | undefined;
    if (raw instanceof DevToken) return raw;
    const r = raw as Record<string, unknown>;

    const roleVal =
      (r._role as Role) ?? (r.role as Role) ?? (Role.MEMBER as Role);

    const expiresAt =
      r.expiresAt instanceof Date
        ? r.expiresAt
        : typeof r.expiresAt === 'string' || typeof r.expiresAt === 'number'
          ? new Date(r.expiresAt)
          : new Date();

    const revokedAtRaw =
      r._revokedAt !== undefined ? r._revokedAt : r.revokedAt;
    const revokedAt =
      revokedAtRaw instanceof Date
        ? revokedAtRaw
        : typeof revokedAtRaw === 'string' || typeof revokedAtRaw === 'number'
          ? new Date(revokedAtRaw)
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

    return new DevToken(
      typeof r.id === 'number' ? r.id : 0,
      typeof r.name === 'string' ? r.name : '',
      typeof r.jti === 'string' ? r.jti : '',
      roleVal,
      expiresAt,
      typeof r.createdBy === 'number' ? r.createdBy : 0,
      revokedAt,
      version,
      createdAt,
      updatedAt,
    );
  }
}
