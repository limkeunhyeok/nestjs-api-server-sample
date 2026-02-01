import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { createTestApp } from './create-test-app';
import { TestService } from './test.service';

export interface E2ETestContext {
  app: INestApplication;
  module: TestingModule;
  req: TestAgent;
}

export const initE2ETest = (
  setup?: (context: E2ETestContext) => Promise<void>,
) => {
  const context: E2ETestContext = {
    app: null as any,
    module: null as any,
    req: null as any,
  };

  beforeAll(async () => {
    const result = await createTestApp();
    context.app = result.app;
    context.module = result.module;

    await context.app.init();
    (global as any).testApp = context.app;

    context.req = request(context.app.getHttpServer());

    if (setup) {
      await setup(context);
    }
  });

  afterAll(async () => {
    const testService = context.app.get(TestService);
    await testService.cleanDatabase();
    await context.app.close();
    delete (global as any).testApp;
  });

  return context;
};
