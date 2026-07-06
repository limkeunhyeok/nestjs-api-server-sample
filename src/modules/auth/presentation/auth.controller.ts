import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserInToken } from 'src/common/decorators/user-in-token.decorator';
import { UserResponseDto } from '../../users/presentation/responses/user-response.dto';
import { AuthTokens } from '../auth.interface';
import { AuthService } from '../application/auth.service';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokensDto } from '../dtos/refresh-token.dto';
import { RegisterDto } from '../dtos/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 분당 10회 (전역보다 약간 타이트하게)
  async register(@Body() dto: RegisterDto): Promise<AuthTokens> {
    return await this.authService.registerUser(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 분당 5회 (브루트포스 방지)
  async login(@Body() dto: LoginDto): Promise<AuthTokens> {
    return await this.authService.loginUser(dto);
  }

  @ApiBearerAuth('accessToken')
  @Roles([])
  @Get('me')
  async getMe(@UserInToken('sub') userId: number): Promise<UserResponseDto> {
    const user = await this.authService.getAuthorizedUserById(userId);
    return UserResponseDto.fromDomain(user);
  }

  @Post('refresh')
  async refreshTokens(@Body() dto: RefreshTokensDto): Promise<AuthTokens> {
    return await this.authService.refreshTokens(dto);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 분당 3회
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ newPassword: string }> {
    return await this.authService.resetPassword(dto);
  }

  @ApiBearerAuth('accessToken')
  @Roles([])
  @Post('logout')
  async logout(
    @Headers('authorization') rawToken: string,
  ): Promise<{ message: string }> {
    await this.authService.logout(rawToken);
    return { message: 'Successfully logged out.' };
  }
}
