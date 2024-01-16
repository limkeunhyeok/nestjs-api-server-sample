import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserInToken } from 'src/common/decorators/user.decorator';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-in')
  async signIn(@Body() dto: SignInDto) {
    return await this.authService.signIn(dto);
  }

  @Post('/sign-up')
  async signUp(@Body() dto: SignUpDto) {
    return await this.authService.signUp(dto);
  }

  @ApiBearerAuth('accessToken')
  @Post('/verify-password')
  async verifyPassword(
    @Body() dto: VerifyPasswordDto,
    @UserInToken() userId: number,
  ) {
    return await this.authService.verifyPassword(userId, dto);
  }

  @ApiBearerAuth('accessToken')
  @Get('/me')
  async getMe(@UserInToken() userId: number) {
    return await this.authService.getMe(userId);
  }
}
