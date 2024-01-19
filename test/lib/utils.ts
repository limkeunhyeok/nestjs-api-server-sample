import { Role, UserEntity } from 'src/modules/users/user.entity';
import request, { Response } from 'supertest';
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

export async function fetchHeaders(req: request.SuperTest<request.Test>) {
  const res = await req.get('/health-check/server').expect(200);
  return getHeadersFrom(res);
}

export async function fetchUserTokenAndHeaders(
  req: request.SuperTest<request.Test>,
  userRepository: Repository<UserEntity>,
  userType: Role = Role.MEMBER,
) {
  const userRaw = mockUserRaw(userType);
  const user = await createUser(userRepository, userRaw);

  const headers = await fetchHeaders(req);
  const withHeaders = withHeadersBy(headers);

  const signInParams = extractSignInParams(userRaw);

  const res = await withHeaders(
    req.post('/auth/sign-in').send(signInParams),
  ).expect(201);

  const headersWithToken = getHeadersFrom(res, {
    ...headers,
    token: res.body.accessToken,
  });
  return headersWithToken;
}
