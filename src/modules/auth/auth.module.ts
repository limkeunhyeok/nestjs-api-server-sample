import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../users/user.module';
import { ActiveUsersController } from './presentation/controllers/active-users.controller';
import { ActiveUsersService } from './application/services/active-users.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/auth.service';
import { DevTokenController } from './presentation/controllers/dev-token.controller';
import { DevTokenOrmEntity } from './infrastructure/persistence/entities/dev-token.orm-entity';
import { DevTokenService } from './application/services/dev-token.service';
import { DevTokenRepository } from './infrastructure/persistence/repositories/dev-token.repository';
import { DEV_TOKEN_REPOSITORY_PORT } from './domain/repositories/dev-token.repository.port';
import { JwksController } from './presentation/controllers/jwks.controller';
import { TokenBlacklistService } from './application/services/token-blacklist.service';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([DevTokenOrmEntity])],
  providers: [
    AuthService,
    DevTokenService,
    TokenBlacklistService,
    ActiveUsersService,
    {
      provide: DEV_TOKEN_REPOSITORY_PORT,
      useClass: DevTokenRepository,
    },
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
