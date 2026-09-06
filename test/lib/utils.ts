import { Role } from 'src/common/constants/role.const';
import { UserEntity } from 'src/modules/users/infrastructure/persistence/entities/user.orm-entity';
import request, { Response } from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { extractSignInParams } from 'test/mockup/auth';
import { createUser, mockUserRaw } from 'test/mockup/user';
import { Repository } from 'typeorm';

export interface Headers {
  token?: string;
}

export function setHeaders(
  req: request.Test,
  headers: Headers,
  options: Partial<Record<keyof Headers, boolean>> = {},
) {
  if (headers.token && !(typeof options.token !== 'undefined')) {
    req.auth(headers.token, { type: 'bearer' });
  }
  return req;
}

export function withHeadersBy(
  headers: Headers,
  options?: Partial<Record<keyof Headers, boolean>>,
) {
  return function withHeaders(req: request.Test) {
    return setHeaders(req, headers, options);
  };
}

export function getHeadersFrom(res: Response, headers: Headers = {}): Headers {
  const token = headers.token;

  return {
    token,
  };
}

export async function fetchHeaders(req: TestAgent, userRaw?: any) {
  let token: string | undefined;

  if (userRaw) {
    const signInParams = extractSignInParams(userRaw);
    const loginRes = await req.post('/auth/login').send(signInParams).expect(201);
    token = loginRes.body.accessToken;
  }

  const res = await req.get('/health-check/server').expect(200);
  return getHeadersFrom(res, { token });
}

export async function fetchHeadersByMember(
  req: TestAgent,
  userRaw: any,
) {
  const signInParams = extractSignInParams(userRaw);
  const loginRes = await req.post('/auth/login').send(signInParams).expect(201);
  const token = loginRes.body.accessToken;

  const res = await req.get('/health-check/server').expect(200);
  return getHeadersFrom(res, { token });
}

export async function fetchUserTokenAndHeaders(
  req: TestAgent,
  userRepository: Repository<UserEntity>,
  userType: Role = Role.MEMBER,
) {
  const userRaw = mockUserRaw(userType);
  const user = await createUser(userRepository, userRaw);

  const headers = await fetchHeaders(req);
  const withHeaders = withHeadersBy(headers);

  const signInParams = extractSignInParams(userRaw);

  const res = await withHeaders(
    req.post('/auth/login').send(signInParams),
  ).expect(201);

  const headersWithToken = getHeadersFrom(res, {
    ...headers,
    token: res.body.accessToken,
  });
  return headersWithToken;
}
