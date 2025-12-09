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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserInToken } from 'src/common/decorators/user-in-token.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { TokenPayload } from 'src/libs/token';
import { Role } from '../../common/constants/role.const';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginateUsersDto } from './dto/paginate-user.dto';
import { UpdateUserByIdDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('users')
@ApiBearerAuth('accessToken')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(RoleGuard([Role.ADMIN]))
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
    @UserInToken() payload: TokenPayload,
  ) {
    return await this.userService.updateUser(userId, body, payload);
  }

  @Delete('/:userId')
  async delete(
    @Param('userId') userId: number,
    @UserInToken() payload: TokenPayload,
  ) {
    return await this.userService.deleteUser(userId, payload);
  }
}
