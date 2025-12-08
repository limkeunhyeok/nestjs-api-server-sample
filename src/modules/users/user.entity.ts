import { Exclude } from 'class-transformer';
import { CustomEntity } from 'src/common/databases/custom.entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { CommentEntity } from '../comments/comment.entity';
import { PostEntity } from '../posts/post.entity';

export const Role = {
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

@Entity('user')
export class UserEntity extends CustomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  @Index({ unique: true })
  email: string;

  @Column({ type: 'varchar' })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', default: Role.MEMBER })
  role: Role;

  @Column({ type: 'timestamptz' })
  latestTryLoginDate: Date;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: Relation<PostEntity[]>;

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: Relation<CommentEntity[]>;
}
