import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ServerEnv } from 'src/configurations/server.config';
import { createToken } from 'src/libs/token';
import { Repository } from 'typeorm';
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
    private readonly userService: UserService,
    private readonly configService: ConfigService<ServerEnv, true>,
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
      this.configService.get<string>('ACCESS_TOKEN_SECRET'),
    );

    return { accessToken };
  }

  async signUp({ email, password, role }: SignUpDto) {
    const user = await this.userService.createUser({ email, password, role });

    const accessToken = createToken(
      { userId: user.id, role: user.role },
      this.configService.get<string>('ACCESS_TOKEN_SECRET'),
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
    return await this.userService.getUserById(userId);
  }
}
