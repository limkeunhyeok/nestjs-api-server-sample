import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/constants/role.const';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserInToken } from 'src/common/decorators/user-in-token.decorator';
import { DevTokenOrmEntity } from '../../infrastructure/persistence/entities/dev-token.orm-entity';
import { DevTokenService } from '../../application/services/dev-token.service';
import { CreateDevTokenDto } from '../../application/dto/create-dev-token.dto';

@ApiTags('dev-tokens')
@ApiBearerAuth('accessToken')
@Controller('auth/dev-tokens')
export class DevTokenController {
  constructor(private readonly devTokenService: DevTokenService) {}

  @Post()
  @Roles([Role.ADMIN])
  async createDevToken(
    @Body() dto: CreateDevTokenDto,
    @UserInToken('sub') userId: number,
  ): Promise<{ token: string; devToken: DevTokenOrmEntity }> {
    return await this.devTokenService.createDevToken({
      ...dto,
      createdBy: userId,
    });
  }

  @Get()
  @Roles([Role.ADMIN])
  async listDevTokens(): Promise<DevTokenOrmEntity[]> {
    return await this.devTokenService.listDevTokens();
  }

  @Delete(':id')
  @Roles([Role.ADMIN])
  async revokeDevToken(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DevTokenOrmEntity> {
    return await this.devTokenService.revokeDevToken(id);
  }
}
