import { CustomEntity } from 'src/typeorm/custom.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  role: Role;

  @Column({ type: 'timestamptz' })
  latestTryLoginDate: Date;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: PostEntity[];
}
