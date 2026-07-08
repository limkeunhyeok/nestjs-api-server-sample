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

    const raw = domain as unknown as Record<string, unknown>;
    const contentsVal = raw._contents || raw.contents;
    const publishedVal =
      raw._published !== undefined ? raw._published : raw.published;

    dto.contents =
      domain.contents || (typeof contentsVal === 'string' ? contentsVal : '');
    dto.published =
      domain.published !== undefined
        ? domain.published
        : typeof publishedVal === 'boolean'
          ? publishedVal
          : false;

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
