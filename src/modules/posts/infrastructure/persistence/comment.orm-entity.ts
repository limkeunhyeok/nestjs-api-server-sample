import { CustomEntity } from 'src/common/databases/custom.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { UserEntity } from '../../../users/infrastructure/persistence/entities/user.orm-entity';
import { PostEntity } from './post.orm-entity';

@Entity('comment')
export class CommentEntity extends CustomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  contents: string;

  @Column({ type: 'boolean' })
  published: boolean;

  @ManyToOne(() => PostEntity, (post) => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Relation<PostEntity>;

  @Column({ name: 'author_id' })
  authorId: number;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: Relation<UserEntity>;
}
