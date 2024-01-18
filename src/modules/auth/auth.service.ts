import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { serverConfig } from 'src/config';
import { createToken } from 'src/libs/token';
import { DataSource, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { UserEntity } from '../users/user.entity';
import { UserService } from '../users/user.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly datasource: DataSource,
    private readonly userService: UserService,
  ) {}

  @Transactional()
  async signIn({ email, password }: SignInDto) {
    const userEntity = await this.userRepository.findOneBy({ email });

    if (!userEntity) {
      throw new BadRequestException('Incorrect email or password.');
    }

    if (!bcrypt.compareSync(password, userEntity.password)) {
      throw new BadRequestException('Incorrect email or password.');
    }

    userEntity.latestTryLoginDate = new Date();

    await this.userRepository.save(userEntity);

    const accessToken = createToken(
      { userId: userEntity.id, role: userEntity.role },
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

  @Transactional()
  async verifyPassword(userId: number, { confirmPassword }: VerifyPasswordDto) {
    const userEntity = await this.userRepository.findOneBy({ id: userId });

    if (!userEntity) {
      throw new NotFoundException('Not found user entity.');
    }

    const isSuccess = bcrypt.compareSync(confirmPassword, userEntity.password);

    const message = isSuccess
      ? 'Password verified successfully.'
      : 'Incorrect password.';

    return { success: isSuccess, message };
  }

  async getMe(userId: number) {
    return await this.userService.getById(userId);
  }
}
