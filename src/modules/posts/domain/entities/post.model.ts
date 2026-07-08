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
}
