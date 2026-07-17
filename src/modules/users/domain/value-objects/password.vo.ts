export class Password {
  private readonly _hash: string;

  constructor(hash: string) {
    if (!hash || hash.trim().length === 0) {
      throw new Error('비밀번호 해시는 비어있을 수 없습니다.');
    }
    this._hash = hash;
  }

  get hash(): string {
    return this._hash;
  }

  static validateRawPassword(raw: string): void {
    if (!raw || raw.length < 8 || raw.length > 15) {
      throw new Error('비밀번호는 8자 이상, 15자 이하여야 합니다.');
    }
  }
}
