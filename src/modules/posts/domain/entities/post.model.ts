import { User } from 'src/modules/users/domain/entities/user.model';
import { Comment } from './comment.model';

export class Post {
  constructor(
    public readonly id: number,
    private _title: string,
    private _contents: string,
    private _published: boolean,
    public readonly authorId: number,
    public readonly author?: User,
    public readonly comments?: Comment[],
    public readonly version?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  get title(): string {
    return this._title;
  }

  get contents(): string {
    return this._contents;
  }

  get published(): boolean {
    return this._published;
  }

  update(params: { title?: string; contents?: string; published?: boolean }) {
    if (params.title !== undefined) this._title = params.title;
    if (params.contents !== undefined) this._contents = params.contents;
    if (params.published !== undefined) this._published = params.published;
  }

  static reconstitute(raw: unknown): Post | null | undefined {
    if (!raw || typeof raw !== 'object') return raw as null | undefined;
    if (raw instanceof Post) return raw;
    const r = raw as Record<string, unknown>;
    const title =
      typeof r._title === 'string'
        ? r._title
        : typeof r.title === 'string'
          ? r.title
          : '';
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
    const comments = Array.isArray(r.comments)
      ? r.comments
          .map((c) => Comment.reconstitute(c))
          .filter((c): c is Comment => c instanceof Comment)
      : undefined;
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

    return new Post(
      typeof r.id === 'number' ? r.id : 0,
      title,
      contents,
      published,
      authorId,
      author,
      comments,
      version,
      createdAt,
      updatedAt,
    );
  }
}
