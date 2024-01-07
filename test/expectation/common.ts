import { Response } from 'supertest';

export function expectPagingResponseSucceed(res: Response) {
  const body = res.body;

  expect(body).toHaveProperty('total');
  expect(body).toHaveProperty('limit');
  expect(body).toHaveProperty('offset');
  expect(body).toHaveProperty('data');
}

export function expectResponseFailed(res: Response) {
  const body = res.body;

  expect(body).toHaveProperty('status');
  expect(body).toHaveProperty('message');
  expect(body).toHaveProperty('error');
  expect(body).toHaveProperty('timestamp');
  expect(body).toHaveProperty('path');
}
