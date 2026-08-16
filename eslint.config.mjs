// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'ecosystem.config.js',
      'test/',
      '**/*.spec.ts',
      '**/*.e2e-spec.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    files: ['src/**/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@nestjs/common',
              message:
                'Domain layer must be framework-independent. Do not import @nestjs/common in domain.',
            },
            {
              name: '@nestjs/core',
              message:
                'Domain layer must be framework-independent. Do not import @nestjs/core in domain.',
            },
            {
              name: '@nestjs/typeorm',
              message:
                'Domain layer must be framework-independent. Do not import @nestjs/typeorm in domain.',
            },
            {
              name: '@nestjs/swagger',
              message:
                'Domain layer must be framework-independent. Do not import @nestjs/swagger in domain.',
            },
            {
              name: 'typeorm',
              message:
                'Domain layer must not depend on TypeORM. Use repository ports instead.',
            },
            {
              name: 'typeorm-transactional',
              message:
                'Domain layer must not depend on transactional library.',
            },
            {
              name: 'express',
              message: 'Domain layer must not depend on Express.',
            },
          ],
          patterns: [
            {
              group: [
                '**/infrastructure/**',
                '**/presentation/**',
                '**/application/**',
              ],
              message:
                'Domain layer must not import from infrastructure, presentation, or application layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/presentation/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/infrastructure/persistence/entities/**',
                '**/*.orm-entity',
              ],
              message:
                'Presentation layer must not import ORM entities directly. Use Response DTOs and Domain models instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/presentation/**'],
              message:
                'Application layer must not import from presentation layer.',
            },
          ],
        },
      ],
    },
  },
);
