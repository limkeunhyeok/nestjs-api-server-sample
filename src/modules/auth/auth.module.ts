import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../users/user.module';
import { ActiveUsersController } from './active-users.controller';
import { ActiveUsersService } from './active-users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DevTokenController } from './dev-token.controller';
import { DevTokenEntity } from './dev-token.entity';
import { DevTokenService } from './dev-token.service';
import { JwksController } from './jwks.controller';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([DevTokenEntity])],
  providers: [
    AuthService,
    DevTokenService,
    TokenBlacklistService,
    ActiveUsersService,
  ],
  controllers: [
    AuthController,
    DevTokenController,
    ActiveUsersController,
    JwksController,
  ],
  exports: [
    AuthService,
    TokenBlacklistService,
    DevTokenService,
    ActiveUsersService,
  ],
})
export class AuthModule {}
