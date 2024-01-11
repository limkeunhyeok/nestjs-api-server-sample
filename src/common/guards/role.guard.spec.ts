import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RoleGuard } from './role.guard';

describe('RoleGuard Unit Test', () => {
  let roleGuard: ReturnType<typeof RoleGuard>;

  let adminMemberGuard: CanActivate;
  let adminGuard: CanActivate;
  let memberGuard: CanActivate;
  let emptyGuard: CanActivate;

  describe('Admin, Member Guard', () => {
    roleGuard = RoleGuard(['admin', 'member']);
    adminMemberGuard = new roleGuard();

    it('should grant access to an admin user', () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: 'admin',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(adminMemberGuard.canActivate(mockExecutionContext)).toEqual(true);
    });

    it('should grant access to an member user', () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: 'member',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(adminMemberGuard.canActivate(mockExecutionContext)).toEqual(true);
    });

    it('should throw an error when the token lacks role information', () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {},
          }),
        }),
      } as unknown as ExecutionContext;

      expect(() => adminMemberGuard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should throw an error when the token contains an unrecognized role', () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: 'role',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(() => adminMemberGuard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Admin Guard', () => {
    roleGuard = RoleGuard(['admin']);
    adminGuard = new roleGuard();

    it('should grant access to an admin user', () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: 'admin',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(adminGuard.canActivate(mockExecutionContext)).toEqual(true);
    });

    it('should throw an error when the token contains a "member" role that is not granted access', () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: 'member',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(() => adminGuard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Member Guard', () => {
    roleGuard = RoleGuard(['member']);
    memberGuard = new roleGuard();

    it('should grant access to an member user', () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: 'member',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(memberGuard.canActivate(mockExecutionContext)).toEqual(true);
    });

    it('should throw an error when the token contains a "admin" role that is not granted access', () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: 'admin',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(() => memberGuard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Empty Guard', () => {
    roleGuard = RoleGuard([]);
    emptyGuard = new roleGuard();

    it('should allow access when an empty array is provided, indicating all roles are permitted', () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: 'member',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(emptyGuard.canActivate(mockExecutionContext)).toEqual(true);
    });

    it('should allow access when an empty array is provided, indicating all roles are permitted', () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: 'admin',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(emptyGuard.canActivate(mockExecutionContext)).toEqual(true);
    });
  });
});
