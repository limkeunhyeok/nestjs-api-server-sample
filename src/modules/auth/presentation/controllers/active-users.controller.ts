import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/constants/role.const';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ActiveUsersService } from '../../application/services/active-users.service';

@ApiTags('active-users')
@ApiBearerAuth('accessToken')
@Controller('auth/active-users')
export class ActiveUsersController {
  constructor(private readonly activeUsersService: ActiveUsersService) {}

  @Get('count')
  @Roles([Role.ADMIN])
  async getActiveUserCount(): Promise<{ count: number }> {
    const count = await this.activeUsersService.getActiveUserCount();
    return { count };
  }

  @Get()
  @Roles([Role.ADMIN])
  async getActiveUsers(): Promise<{ userIds: string[] }> {
    const userIds = await this.activeUsersService.getActiveUserIds();
    return { userIds };
  }
}
