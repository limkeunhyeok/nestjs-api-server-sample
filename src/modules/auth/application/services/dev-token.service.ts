import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Role } from 'src/common/constants/role.const';
import { NodeEnv, ServerEnv } from 'src/configurations/server.config';
import { JoseJwtService } from 'src/common/jose-jwt/jose-jwt.service';
import { TOKEN_TYPE_DEV } from '../../auth.const';
import { DevToken } from '../../domain/entities/dev-token.model';
import {
  DEV_TOKEN_REPOSITORY_PORT,
  DevTokenRepositoryPort,
} from '../../domain/repositories/dev-token.repository.port';
import {
  DevTokenBadRequestException,
  DevTokenNotFoundException,
} from '../../exceptions/auth.exception';

@Injectable()
export class DevTokenService {
  constructor(
    @Inject(DEV_TOKEN_REPOSITORY_PORT)
    private readonly devTokenRepository: DevTokenRepositoryPort,
    private readonly joseJwtService: JoseJwtService,
    private readonly configService: ConfigService<ServerEnv, true>,
  ) {}

  async createDevToken(params: {
    name: string;
    role?: Role;
    expiresIn?: string;
    createdBy: number;
  }): Promise<{ token: string; devToken: DevToken }> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv === NodeEnv.PROD) {
      throw new DevTokenBadRequestException(
        'Dev tokens cannot be created in production environment.',
      );
    }

    const role = params.role ?? Role.MEMBER;
    const expiresIn = params.expiresIn ?? '365d';
    const jti = crypto.randomUUID();

    const token = await this.joseJwtService.sign(
      {
        sub: params.createdBy.toString(),
        role,
        type: TOKEN_TYPE_DEV,
        jti,
        devTokenName: params.name,
      },
      expiresIn,
    );

    const expiresAt = this.calculateExpiresAt(expiresIn);

    const devToken = new DevToken(
      0,
      params.name,
      jti,
      role,
      expiresAt,
      params.createdBy,
    );

    const saved = await this.devTokenRepository.save(devToken);

    return { token, devToken: saved };
  }

  async listDevTokens(): Promise<DevToken[]> {
    return await this.devTokenRepository.findAllActive();
  }

  async revokeDevToken(id: number): Promise<DevToken> {
    const devToken = await this.devTokenRepository.findById(id);

    if (!devToken) {
      throw new DevTokenNotFoundException(`Dev token with id ${id} not found.`);
    }

    if (devToken.isRevoked()) {
      throw new DevTokenBadRequestException(
        `Dev token with id ${id} is already revoked.`,
      );
    }

    devToken.revoke();
    return await this.devTokenRepository.save(devToken);
  }

  async isDevTokenRevoked(jti: string): Promise<boolean> {
    const devToken = await this.devTokenRepository.findByJti(jti);

    if (!devToken) {
      return true;
    }

    return devToken.isRevoked();
  }

  private calculateExpiresAt(expiresIn: string): Date {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)(s|m|h|d)$/);

    if (!match) {
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(now.getTime() + value * multipliers[unit]);
  }
}
