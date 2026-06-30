import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './application/user.service';
import { UserEntity } from './infrastructure/persistence/user.orm-entity';
import { UserController } from './presentation/user.controller';
import { USER_REPOSITORY_PORT } from './domain/repository-ports/user.repository.port';
import { UserRepositoryAdapter } from './infrastructure/persistence/user.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY_PORT,
      useClass: UserRepositoryAdapter,
    },
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
