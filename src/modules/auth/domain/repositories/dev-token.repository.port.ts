import { DevToken } from '../entities/dev-token.model';

export const DEV_TOKEN_REPOSITORY_PORT = Symbol('DEV_TOKEN_REPOSITORY_PORT');

export interface DevTokenRepositoryPort {
  save(devToken: DevToken): Promise<DevToken>;
  findById(id: number): Promise<DevToken | null>;
  findByJti(jti: string): Promise<DevToken | null>;
  findAllActive(): Promise<DevToken[]>;
}
