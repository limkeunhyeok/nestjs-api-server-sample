import * as crypto from 'crypto';

export function generateRandomString(length: number) {
  if (length <= 0) {
    throw new Error('Length must be a positive number');
  }

  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}
