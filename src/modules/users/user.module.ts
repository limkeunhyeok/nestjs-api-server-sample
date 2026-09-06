import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './application/services/user.service';
import { UserEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { UserController } from './presentation/controllers/user.controller';
import { USER_REPOSITORY_PORT } from './domain/repositories/user.repository.port';
import { UserRepositoryAdapter } from './infrastructure/persistence/repositories/user.repository.adapter';

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
