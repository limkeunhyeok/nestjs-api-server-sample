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
import { Role } from 'src/common/constants/role.const';
import { CommentEntity } from '../../../posts/infrastructure/persistence/comment.orm-entity';
import { PostEntity } from '../../../posts/infrastructure/persistence/post.orm-entity';

const ExcludeDeco = Exclude as (options?: {
  toPlainOnly?: boolean;
}) => PropertyDecorator;

@Entity('user')
export class UserEntity extends CustomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  @Index({ unique: true })
  email: string;

  @Column({ type: 'varchar' })
  @ExcludeDeco({ toPlainOnly: true })
  password: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', default: Role.MEMBER })
  role: Role;

  @Column({ type: 'timestamptz', nullable: true })
  latestTryLoginDate?: Date;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: Relation<PostEntity[]>;

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: Relation<CommentEntity[]>;
}
