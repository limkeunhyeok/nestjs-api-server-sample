import { CustomEntity } from 'src/common/databases/custom.entity';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/entities/user.orm-entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { PostOrmEntity } from './post.orm-entity';

@Entity('comment')
export class CommentOrmEntity extends CustomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  contents: string;

  @Column({ type: 'boolean' })
  published: boolean;

  @ManyToOne(() => PostOrmEntity, (post) => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Relation<PostOrmEntity>;

  @Column({ name: 'author_id' })
  authorId: number;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: Relation<UserEntity>;
}
