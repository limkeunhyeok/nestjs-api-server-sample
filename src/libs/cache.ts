import * as crypto from 'crypto';

export function hashString(value: string, length = 8) {
  const hash = crypto.createHash('sha256').update(value).digest('base64url');
  return hash.slice(0, length);
}
