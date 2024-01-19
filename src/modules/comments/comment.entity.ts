import { CustomEntity } from 'src/typeorm/custom.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostEntity } from '../posts/post.entity';
import { UserEntity } from '../users/user.entity';

@Entity('comment')
export class CommentEntity extends CustomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  contents: string;

  @Column({ type: 'boolean' })
  published: boolean;

  @Column({ type: 'int' })
  authorId: number;

  @Column({ type: 'int' })
  postId: number;

  @ManyToOne(() => PostEntity, (post) => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: PostEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;
}
