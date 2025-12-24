import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserInToken } from 'src/common/decorators/user-in-token.decorator';
import { Role } from '../../common/constants/role.const';
import { AccessTokenPayload } from '../auth/auth.interface';
import { CreateUserDto } from './dtos/create-user.dto';
import { PaginateUsersDto } from './dtos/paginate-user.dto';
import { UpdateUserByIdDto } from './dtos/update-user.dto';
import { UserService } from './user.service';

@ApiTags('users')
@ApiBearerAuth('accessToken')
@UseInterceptors(ClassSerializerInterceptor)
@Roles([Role.ADMIN])
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    return await this.userService.createUser(body);
  }

  @Get()
  async paginate(@Query() query: PaginateUsersDto) {
    return await this.userService.paginateUsers(query);
  }

  @Get('/:userId')
  async getOneById(@Param('userId') userId: number) {
    return await this.userService.getUserById(userId);
  }

  @Put('/:userId')
  async update(
    @Param('userId') userId: number,
    @Body() body: UpdateUserByIdDto,
    @UserInToken() payload: AccessTokenPayload,
  ) {
    return await this.userService.updateUser(userId, body, payload);
  }

  @Delete('/:userId')
  async delete(
    @Param('userId') userId: number,
    @UserInToken() payload: AccessTokenPayload,
  ) {
    return await this.userService.deleteUser(userId, payload);
  }
}
