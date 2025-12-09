import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserInToken } from 'src/common/decorators/user-in-token.decorator';
import { UserEntity } from '../users/user.entity';
import { AuthTokens } from './auth.interface';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokensDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthTokens> {
    return await this.authService.registerUser(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthTokens> {
    return await this.authService.loginUser(dto);
  }

  @ApiBearerAuth('accessToken')
  @Roles([])
  @Get('me')
  @UseInterceptors(ClassSerializerInterceptor)
  async getMe(@UserInToken('sub') userId: number): Promise<UserEntity> {
    return await this.authService.getAuthorizedUserById(userId);
  }

  @Roles([])
  @Post('refresh')
  async refreshTokens(@Body() dto: RefreshTokensDto): Promise<AuthTokens> {
    return await this.authService.refreshTokens(dto);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ newPassword: string }> {
    return await this.authService.resetPassword(dto);
  }
}
