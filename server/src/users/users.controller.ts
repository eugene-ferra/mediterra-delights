import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/сommon/guards/auth.guard';
import { User } from 'src/сommon/user.decorator';
import { AccessTokenPayload } from 'src/сommon/types/access-token-payload.type';
import { UserEntity } from './types/user-entity.type';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('/me')
  async getMe(
    @Res({ passthrough: true })
    @User()
    accessTokenPayload: AccessTokenPayload,
  ): Promise<UserEntity> {
    const userId = accessTokenPayload.sub;

    const user = await this.usersService.findById(userId);
    return user;
  }

  @UseGuards(AuthGuard)
  @Patch('/me/info')
  async updateMyInfo(
    @Res({ passthrough: true })
    @User()
    accessTokenPayload: AccessTokenPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<UserEntity> {
    const userId = accessTokenPayload.sub;

    const user = await this.usersService.update(userId, dto);
    return user;
  }

  @UseGuards(AuthGuard)
  @Patch('/me/password')
  async updateMyPassword(
    @Res({ passthrough: true })
    @User()
    accessTokenPayload: AccessTokenPayload,
    @Body() dto: UpdateUserPasswordDto,
  ): Promise<{ changed: true }> {
    const userId = accessTokenPayload.sub;

    const user = await this.usersService.changePassword(userId, dto);
    return user;
  }

  @UseGuards(AuthGuard)
  @Delete('/me')
  async deleteMyAccount(
    @Res({ passthrough: true }) res: Response,
    @User()
    accessTokenPayload: AccessTokenPayload,
  ): Promise<{ deleted: true }> {
    const userId = accessTokenPayload.sub;

    await this.usersService.delete(userId);
    res.clearCookie('refreshToken');

    return { deleted: true };
  }
}
