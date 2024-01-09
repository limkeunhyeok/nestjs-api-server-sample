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
import { CreateUserDto } from './dto/create.dto';
import { GetUsersByQueryDto } from './dto/get.dto';
import { UpdateUserByIdDto } from './dto/update.dto';
import { UserService } from './user.service';

@ApiTags('users')
@ApiBearerAuth('accessToken')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    return await this.userService.create(body);
  }

  @Get()
  async getByQuery(@Query() query: GetUsersByQueryDto) {
    return await this.userService.getByQuery(query);
  }

  @Get('/:userId')
  async getById(@Param('userId') userId: number) {
    return await this.userService.getById(userId);
  }

  @Put('/:userId')
  async updateById(
    @Param('userId') userId: number,
    @Body() body: UpdateUserByIdDto,
  ) {
    return await this.userService.updateById(userId, body);
  }

  @Delete('/:userId')
  async deleteById(@Param('userId') userId: number) {
    return await this.userService.deleteById(userId);
  }
}
