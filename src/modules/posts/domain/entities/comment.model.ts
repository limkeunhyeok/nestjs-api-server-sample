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
}
