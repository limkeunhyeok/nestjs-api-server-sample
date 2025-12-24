import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../constants/role.const';
import { RoleGuard } from './role.guard';

const mockExecutionContext = (user?: { role: any }): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('RoleGuard Unit Test', () => {
  let reflector: jest.Mocked<Reflector>;
  let guard: RoleGuard;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
  });

  describe('Admin, Member Guard', () => {
    beforeEach(() => {
      reflector.get.mockReturnValue([Role.ADMIN, Role.MEMBER]);
      guard = new RoleGuard(reflector);
    });

    it('should grant access to an admin user', () => {
      const ctx = mockExecutionContext({ role: Role.ADMIN });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should grant access to an member user', () => {
      const ctx = mockExecutionContext({ role: Role.MEMBER });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should throw an error when the token lacks role information', () => {
      const ctx = mockExecutionContext(undefined);
      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });

    it('should throw an error when the token contains an unrecognized role', () => {
      const ctx = mockExecutionContext({ role: 'role' });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  describe('Admin Guard', () => {
    beforeEach(() => {
      reflector.get.mockReturnValue([Role.ADMIN]);
      guard = new RoleGuard(reflector);
    });

    it('should grant access to an admin user', () => {
      const ctx = mockExecutionContext({ role: Role.ADMIN });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should throw an error when the token contains a "member" role that is not granted access', () => {
      const ctx = mockExecutionContext({ role: Role.MEMBER });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  describe('Member Guard', () => {
    beforeEach(() => {
      reflector.get.mockReturnValue([Role.MEMBER]);
      guard = new RoleGuard(reflector);
    });

    it('should grant access to an member user', () => {
      const ctx = mockExecutionContext({ role: Role.MEMBER });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should throw an error when the token contains a "admin" role that is not granted access', () => {
      const ctx = mockExecutionContext({ role: Role.ADMIN });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  describe('Empty Guard', () => {
    beforeEach(() => {
      reflector.get.mockReturnValue([]);
      guard = new RoleGuard(reflector);
    });

    it('should allow access when an empty array is provided, indicating all roles are permitted', () => {
      const ctx = mockExecutionContext({ role: Role.MEMBER });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should allow access when an empty array is provided, indicating all roles are permitted', () => {
      const ctx = mockExecutionContext({ role: Role.ADMIN });
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });
});
