import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { IsNull, Repository } from 'typeorm';
import { Role } from '../../common/constants/role.const';
import { NodeEnv, ServerEnv } from '../../configurations/server.config';
import { JoseJwtService } from '../jose-jwt/jose-jwt.service';
import { TOKEN_TYPE_DEV } from './auth.const';
import { DevTokenEntity } from './dev-token.entity';

@Injectable()
export class DevTokenService {
  constructor(
    @InjectRepository(DevTokenEntity)
    private readonly devTokenRepository: Repository<DevTokenEntity>,
    private readonly joseJwtService: JoseJwtService,
    private readonly configService: ConfigService<ServerEnv, true>,
  ) {}

  async createDevToken(params: {
    name: string;
    role?: Role;
    expiresIn?: string;
    createdBy: number;
  }): Promise<{ token: string; devToken: DevTokenEntity }> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv === NodeEnv.PROD) {
      throw new BadRequestException(
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

    const devToken = this.devTokenRepository.create({
      name: params.name,
      jti,
      role,
      expiresAt,
      createdBy: params.createdBy,
    });

    await this.devTokenRepository.save(devToken);

    return { token, devToken };
  }

  async listDevTokens(): Promise<DevTokenEntity[]> {
    return await this.devTokenRepository.find({
      where: { revokedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async revokeDevToken(id: number): Promise<DevTokenEntity> {
    const devToken = await this.devTokenRepository.findOne({ where: { id } });

    if (!devToken) {
      throw new NotFoundException(`Dev token with id ${id} not found.`);
    }

    if (devToken.revokedAt) {
      throw new BadRequestException(
        `Dev token with id ${id} is already revoked.`,
      );
    }

    devToken.revokedAt = new Date();
    return await this.devTokenRepository.save(devToken);
  }

  async isDevTokenRevoked(jti: string): Promise<boolean> {
    const devToken = await this.devTokenRepository.findOne({
      where: { jti },
    });

    if (!devToken) {
      return true;
    }

    return devToken.revokedAt !== null;
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
