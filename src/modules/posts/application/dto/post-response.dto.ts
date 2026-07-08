import { UserResponseDto } from 'src/modules/users/application/dto/user-response.dto';
import { Post } from '../../domain/entities/post.model';
import { CommentResponseDto } from './comment-response.dto';

export class PostResponseDto {
  id: number;
  title: string;
  contents: string;
  published: boolean;
  authorId: number;
  author?: UserResponseDto;
  comments?: CommentResponseDto[];
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;

  static fromDomain(domain: Post): PostResponseDto {
    const dto = new PostResponseDto();
    dto.id = domain.id;

    const raw = domain as unknown as Record<string, unknown>;
    const titleVal = raw._title || raw.title;
    const contentsVal = raw._contents || raw.contents;
    const publishedVal =
      raw._published !== undefined ? raw._published : raw.published;

    dto.title = domain.title || (typeof titleVal === 'string' ? titleVal : '');
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
    if (domain.comments) {
      dto.comments = domain.comments.map((c) =>
        CommentResponseDto.fromDomain(c),
      );
    }
    dto.version = domain.version;
    dto.createdAt = domain.createdAt;
    dto.updatedAt = domain.updatedAt;
    return dto;
  }
}
