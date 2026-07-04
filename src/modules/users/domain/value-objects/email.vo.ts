export class Email {
  readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('유효하지 않은 이메일 형식입니다.');
    }
    this.value = value;
  }

  private isValid(email: string): boolean {
    return /\S+@\S+\.\S+/.test(email);
  }
}
