import { Reflector } from '@nestjs/core';
import { Role } from '../constants/role.const';

export const Roles = Reflector.createDecorator<Role[]>();
