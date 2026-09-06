import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/constants/role.const';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserInToken } from 'src/common/decorators/user-in-token.decorator';
import { PaginationResponse } from 'src/common/interfaces/pagination.interface';
import { AuthUser } from 'src/modules/auth/auth.interface';
import { UserService } from 'src/modules/users/application/services/user.service';
import { CreateUserDto } from 'src/modules/users/application/dto/create-user.dto';
import { PaginateUsersDto } from 'src/modules/users/application/dto/paginate-user.dto';
import { UpdateUserByIdDto } from 'src/modules/users/application/dto/update-user.dto';
import { UserResponseDto } from 'src/modules/users/application/dto/user-response.dto';

@ApiTags('users')
@ApiBearerAuth('accessToken')
@Roles([Role.ADMIN])
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() body: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.createUser(body);
    return UserResponseDto.fromDomain(user);
  }

  @Get()
  async paginate(
    @Query() query: PaginateUsersDto,
  ): Promise<PaginationResponse<UserResponseDto>> {
    const pagination = await this.userService.paginateUsers({
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });

    return {
      ...pagination,
      data: pagination.data.map((user) => UserResponseDto.fromDomain(user)),
    };
  }

  @Get('/:userId')
  async getOneById(@Param('userId') userId: number): Promise<UserResponseDto> {
    const user = await this.userService.getUserById(userId);
    return UserResponseDto.fromDomain(user);
  }

  @Put('/:userId')
  async update(
    @Param('userId') userId: number,
    @Body() body: UpdateUserByIdDto,
    @UserInToken() payload: AuthUser,
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUser(userId, body, payload);
    return UserResponseDto.fromDomain(user);
  }

  @Delete('/:userId')
  async delete(
    @Param('userId') userId: number,
    @UserInToken() payload: AuthUser,
  ): Promise<UserResponseDto> {
    const user = await this.userService.deleteUser(userId, payload);
    return UserResponseDto.fromDomain(user);
  }
}
