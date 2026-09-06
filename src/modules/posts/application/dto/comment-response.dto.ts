import { UserResponseDto } from 'src/modules/users/application/dto/user-response.dto';
import { Comment } from '../../domain/entities/comment.model';
import { PostResponseDto } from './post-response.dto';

export class CommentResponseDto {
  id: number;
  contents: string;
  published: boolean;
  authorId: number;
  author?: UserResponseDto;
  post?: PostResponseDto;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;

  static fromDomain(domain: Comment): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = domain.id;
    dto.contents = domain.contents;
    dto.published = domain.published;
    dto.authorId = domain.authorId;
    if (domain.author) {
      dto.author = UserResponseDto.fromDomain(domain.author);
    }
    if (domain.post) {
      dto.post = PostResponseDto.fromDomain(domain.post);
    }
    dto.version = domain.version;
    dto.createdAt = domain.createdAt;
    dto.updatedAt = domain.updatedAt;
    return dto;
  }
}
