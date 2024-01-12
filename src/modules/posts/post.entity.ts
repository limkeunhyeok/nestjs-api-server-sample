import { CustomEntity } from 'src/typeorm/custom.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity('post')
export class PostEntity extends CustomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  contents: string;

  @Column({ type: 'boolean' })
  published: boolean;

  @Column({ type: 'int' })
  authorId: number;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;
}
