import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiException } from '../exceptions/api.exception';
import { Role } from '../constants/role.const';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Roles } from '../decorators/roles.decorator';
import { RoleGuard } from './role.guard';

const mockExecutionContext = (user?: { role: any }): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('RoleGuard Unit Test', () => {
  let reflector: jest.Mocked<Reflector>;
  let guard: RoleGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
  });

  describe('Public Route', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockImplementation((metadataKey) => {
        if (metadataKey === IS_PUBLIC_KEY) {
          return true;
        }
        return undefined;
      });
      guard = new RoleGuard(reflector);
    });

    it('should grant access when route is public without user', () => {
      const ctx = mockExecutionContext(undefined);
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('Admin, Member Guard', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockImplementation((metadataKey) => {
        if (metadataKey === IS_PUBLIC_KEY) {
          return false;
        }
        if (metadataKey === Roles) {
          return [Role.ADMIN, Role.MEMBER];
        }
        return undefined;
      });
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
      try {
        guard.canActivate(ctx);
        fail('should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException);
        expect((error as ApiException).status).toBe(
          HttpStatus.UNAUTHORIZED,
        );
      }
    });

    it('should throw an error when the token contains an unrecognized role', () => {
      const ctx = mockExecutionContext({ role: 'role' });
      try {
        guard.canActivate(ctx);
        fail('should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException);
        expect((error as ApiException).status).toBe(HttpStatus.FORBIDDEN);
      }
    });
  });

  describe('Admin Guard', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockImplementation((metadataKey) => {
        if (metadataKey === IS_PUBLIC_KEY) {
          return false;
        }
        if (metadataKey === Roles) {
          return [Role.ADMIN];
        }
        return undefined;
      });
      guard = new RoleGuard(reflector);
    });

    it('should grant access to an admin user', () => {
      const ctx = mockExecutionContext({ role: Role.ADMIN });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should throw an error when the token contains a "member" role that is not granted access', () => {
      const ctx = mockExecutionContext({ role: Role.MEMBER });
      try {
        guard.canActivate(ctx);
        fail('should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException);
        expect((error as ApiException).status).toBe(HttpStatus.FORBIDDEN);
      }
    });
  });

  describe('Member Guard', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockImplementation((metadataKey) => {
        if (metadataKey === IS_PUBLIC_KEY) {
          return false;
        }
        if (metadataKey === Roles) {
          return [Role.MEMBER];
        }
        return undefined;
      });
      guard = new RoleGuard(reflector);
    });

    it('should grant access to an member user', () => {
      const ctx = mockExecutionContext({ role: Role.MEMBER });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should throw an error when the token contains a "admin" role that is not granted access', () => {
      const ctx = mockExecutionContext({ role: Role.ADMIN });
      try {
        guard.canActivate(ctx);
        fail('should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException);
        expect((error as ApiException).status).toBe(HttpStatus.FORBIDDEN);
      }
    });
  });

  describe('Empty Guard', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockImplementation((metadataKey) => {
        if (metadataKey === IS_PUBLIC_KEY) {
          return false;
        }
        if (metadataKey === Roles) {
          return [];
        }
        return undefined;
      });
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
