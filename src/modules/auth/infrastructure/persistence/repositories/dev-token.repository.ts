import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { DevToken } from '../../../domain/entities/dev-token.model';
import { DevTokenRepositoryPort } from '../../../domain/repositories/dev-token.repository.port';
import { DevTokenOrmEntity } from '../entities/dev-token.orm-entity';
import { DevTokenMapper } from '../mappers/dev-token.mapper';

@Injectable()
export class DevTokenRepository implements DevTokenRepositoryPort {
  constructor(
    @InjectRepository(DevTokenOrmEntity)
    private readonly typeormRepository: Repository<DevTokenOrmEntity>,
  ) {}

  async save(devToken: DevToken): Promise<DevToken> {
    const ormEntity = DevTokenMapper.toOrmEntity(devToken);
    const saved = await this.typeormRepository.save(ormEntity);
    return DevTokenMapper.toDomain(saved);
  }

  async findById(id: number): Promise<DevToken | null> {
    const ormEntity = await this.typeormRepository.findOne({
      where: { id },
    });
    return ormEntity ? DevTokenMapper.toDomain(ormEntity) : null;
  }

  async findByJti(jti: string): Promise<DevToken | null> {
    const ormEntity = await this.typeormRepository.findOne({
      where: { jti },
    });
    return ormEntity ? DevTokenMapper.toDomain(ormEntity) : null;
  }

  async findAllActive(): Promise<DevToken[]> {
    const ormEntities = await this.typeormRepository.find({
      where: { revokedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => DevTokenMapper.toDomain(entity));
  }
}
