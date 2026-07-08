import { Role } from 'src/common/constants/role.const';
import { CustomEntity } from 'src/common/databases/custom.entity';
import { CommentOrmEntity } from 'src/modules/posts/infrastructure/persistence/entities/comment.orm-entity';
import { PostOrmEntity } from 'src/modules/posts/infrastructure/persistence/entities/post.orm-entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('user')
export class UserEntity extends CustomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  @Index({ unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', default: Role.MEMBER })
  role: Role;

  @Column({ type: 'timestamptz', nullable: true })
  latestTryLoginDate?: Date | null;

  @OneToMany(() => PostOrmEntity, (post) => post.author)
  posts: Relation<PostOrmEntity[]>;

  @OneToMany(() => CommentOrmEntity, (comment) => comment.author)
  comments: Relation<CommentOrmEntity[]>;
}
