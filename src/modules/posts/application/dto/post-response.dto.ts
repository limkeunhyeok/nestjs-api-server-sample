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
    dto.title = domain.title;
    dto.contents = domain.contents;
    dto.published = domain.published;
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
