import { CustomEntity } from 'src/common/databases/custom.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { UserEntity } from '../../../users/infrastructure/persistence/entities/user.orm-entity';
import { CommentEntity } from './comment.orm-entity';

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

  @Column({ name: 'author_id' })
  authorId: number;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: Relation<UserEntity>;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: Relation<CommentEntity[]>;
}
