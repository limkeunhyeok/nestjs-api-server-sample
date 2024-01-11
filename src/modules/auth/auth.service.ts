import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { serverConfig } from 'src/config';
import { createToken } from 'src/libs/token';
import { DataSource } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { UserService } from '../users/user.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly datasource: DataSource,
    private readonly userService: UserService,
  ) {}

  async signIn({ email, password }: SignInDto) {
    const user = await this.datasource.manager.transaction(async (manager) => {
      const userEntity = await manager.findOneBy(UserEntity, { email });

      if (!userEntity) {
        throw new BadRequestException('Incorrect email or password.');
      }

      if (!bcrypt.compareSync(password, userEntity.password)) {
        throw new BadRequestException('Incorrect email or password.');
      }

      userEntity.latestTryLoginDate = new Date();

      return await manager.save(UserEntity, userEntity);
    });

    const accessToken = createToken(
      { userId: user.id, role: user.role },
      serverConfig.secretKey,
    );

    return { accessToken };
  }

  async signUp({ email, password, role }: SignUpDto) {
    const user = await this.userService.create({ email, password, role });

    const accessToken = createToken(
      { userId: user.id, role: user.role },
      serverConfig.secretKey,
    );

    return { accessToken };
  }

  async verifyPassword(userId: number, { confirmPassword }: VerifyPasswordDto) {
    const user = await this.datasource.manager.transaction(async (manager) => {
      return await manager.findOneBy(UserEntity, { id: userId });
    });

    if (!user) {
      throw new NotFoundException('Not found user entity.');
    }

    const isSuccess = bcrypt.compareSync(confirmPassword, user.password);

    const message = isSuccess
      ? 'Password verified successfully.'
      : 'Incorrect password.';

    return { success: isSuccess, message };
  }

  async getMe(userId: number) {
    return await this.userService.getById(userId);
  }
}
