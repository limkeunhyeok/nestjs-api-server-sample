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
import { CreateDevTokenDto } from '../../application/dto/create-dev-token.dto';
import { DevTokenResponseDto } from '../../application/dto/dev-token-response.dto';
import { DevTokenService } from '../../application/services/dev-token.service';

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
  ): Promise<{ token: string; devToken: DevTokenResponseDto }> {
    const result = await this.devTokenService.createDevToken({
      ...dto,
      createdBy: userId,
    });
    return {
      token: result.token,
      devToken: DevTokenResponseDto.fromEntity(result.devToken),
    };
  }

  @Get()
  @Roles([Role.ADMIN])
  async listDevTokens(): Promise<DevTokenResponseDto[]> {
    const tokens = await this.devTokenService.listDevTokens();
    return tokens.map((token) => DevTokenResponseDto.fromEntity(token));
  }

  @Delete(':id')
  @Roles([Role.ADMIN])
  async revokeDevToken(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DevTokenResponseDto> {
    const revoked = await this.devTokenService.revokeDevToken(id);
    return DevTokenResponseDto.fromEntity(revoked);
  }
}
