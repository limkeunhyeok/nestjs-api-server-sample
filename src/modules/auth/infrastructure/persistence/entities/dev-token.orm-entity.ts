import { CustomEntity } from 'src/common/databases/custom.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from 'src/common/constants/role.const';

@Entity('dev_token')
export class DevTokenOrmEntity extends CustomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  jti: string;

  @Column({ type: 'varchar', default: Role.MEMBER })
  role: Role;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ type: 'int' })
  createdBy: number;
}
