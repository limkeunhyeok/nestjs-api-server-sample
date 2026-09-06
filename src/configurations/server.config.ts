import { z } from 'zod';

export const NodeEnv = {
  DEV: 'dev',
  PROD: 'prod',
  TEST: 'test',
} as const;
export type NodeEnv = (typeof NodeEnv)[keyof typeof NodeEnv];

export interface ServerEnv {
  NODE_ENV: string;
  PORT: number;

  DB_NAME: string;
  DB_PORT: number;
  DB_HOST: string;
  DB_USER: string;
  DB_PASS: string;

  SALT_ROUND: number;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;

  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_NAME?: string;

  REDIS_PORT: number;
  REDIS_HOST: string;
  REDIS_PASSWORD: string;

  JWT_PRIVATE_JWK: any;
  JWT_PUBLIC_JWK: any;
}

const validateJwk = (isPrivate: boolean) =>
  z.string().transform((val, ctx) => {
    try {
      const obj: unknown = JSON.parse(val);

      if (typeof obj !== 'object' || obj === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'JWK must be a valid JSON object',
        });
        return z.NEVER;
      }

      const jwk = obj as Record<string, any>;
      const requiredFields = ['kty', 'alg', 'crv', 'x', 'y', 'kid', 'use'];
      if (isPrivate) {
        requiredFields.push('d');
      }

      const hasAllFields = requiredFields.every((field) => field in jwk);

      if (!hasAllFields) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `JWK missing required fields: ${requiredFields.join(', ')}`,
        });
        return z.NEVER;
      }

      return jwk;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'JWK must be a valid JSON string',
      });
      return z.NEVER;
    }
  });

export const ServerEnvValidation = z
  .object({
    NODE_ENV: z.nativeEnum(NodeEnv).or(z.enum(['dev', 'prod', 'test'])),
    PORT: z.coerce.number(),

    DB_NAME: z.string(),
    DB_PORT: z.coerce.number(),
    DB_HOST: z.string(),
    DB_USER: z.string(),
    DB_PASS: z.string(),

    SALT_ROUND: z.coerce.number(),
    ACCESS_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_SECRET: z.string(),

    ADMIN_EMAIL: z.string().optional(),
    ADMIN_PASSWORD: z.string().optional(),
    ADMIN_NAME: z.string().optional(),

    REDIS_PORT: z.coerce.number(),
    REDIS_HOST: z.string(),
    REDIS_PASSWORD: z.string(),

    JWT_PRIVATE_JWK: validateJwk(true),
    JWT_PUBLIC_JWK: validateJwk(false),
  })
  .passthrough();
