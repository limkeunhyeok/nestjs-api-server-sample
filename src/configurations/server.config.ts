import * as Joi from 'joi';

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
}

export const ServerEnvValidation = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnv))
    .required(),
  PORT: Joi.number().required(),

  DB_NAME: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_HOST: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),

  SALT_ROUND: Joi.number().required(),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),

  ADMIN_EMAIL: Joi.string(),
  ADMIN_PASSWORD: Joi.string(),
  ADMIN_NAME: Joi.string(),
});
