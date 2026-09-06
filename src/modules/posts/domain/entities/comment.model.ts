import { User } from 'src/modules/users/domain/entities/user.model';
import { Post } from './post.model';

export class Comment {
  constructor(
    public readonly id: number,
    private _contents: string,
    private _published: boolean,
    public readonly authorId: number,
    public readonly author?: User,
    public readonly post?: Post,
    public readonly version?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  get contents(): string {
    return this._contents;
  }

  get published(): boolean {
    return this._published;
  }

  update(params: { contents?: string; published?: boolean }) {
    if (params.contents !== undefined) this._contents = params.contents;
    if (params.published !== undefined) this._published = params.published;
  }

  static reconstitute(raw: unknown): Comment | null | undefined {
    if (!raw || typeof raw !== 'object') return raw as null | undefined;
    if (raw instanceof Comment) return raw;
    const r = raw as Record<string, unknown>;
    const contents =
      typeof r._contents === 'string'
        ? r._contents
        : typeof r.contents === 'string'
          ? r.contents
          : '';
    const published =
      typeof r._published === 'boolean'
        ? r._published
        : typeof r.published === 'boolean'
          ? r.published
          : true;
    const authorId = typeof r.authorId === 'number' ? r.authorId : 0;
    const author = r.author
      ? (User.reconstitute(r.author) ?? undefined)
      : undefined;
    const post = r.post ? (Post.reconstitute(r.post) ?? undefined) : undefined;
    const version = typeof r.version === 'number' ? r.version : undefined;
    const createdAt =
      r.createdAt instanceof Date
        ? r.createdAt
        : typeof r.createdAt === 'string' || typeof r.createdAt === 'number'
          ? new Date(r.createdAt)
          : undefined;
    const updatedAt =
      r.updatedAt instanceof Date
        ? r.updatedAt
        : typeof r.updatedAt === 'string' || typeof r.updatedAt === 'number'
          ? new Date(r.updatedAt)
          : undefined;

    return new Comment(
      typeof r.id === 'number' ? r.id : 0,
      contents,
      published,
      authorId,
      author,
      post,
      version,
      createdAt,
      updatedAt,
    );
  }
}
