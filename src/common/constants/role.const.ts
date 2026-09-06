export const Role = {
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
