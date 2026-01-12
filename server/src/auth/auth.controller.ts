import {
  Body,
  Controller,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RefreshToken } from './decorator/refresh-token.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { AccessTokenPayload } from 'src/common/types/access-token-payload.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Ip() ip: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const userAgent = req.get('User-Agent') || 'unknown';

    const tokens = await this.authService.register({ dto, userAgent, ip });

    this.setRefreshCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const userAgent = req.get('User-Agent') || 'unknown';

    const tokens = await this.authService.login({ dto, userAgent, ip });

    this.setRefreshCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @RefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const userAgent = req.get('User-Agent') || 'unknown';
    const ip = req.ip;

    const tokens = await this.authService.refresh({
      refreshToken,
      userAgent,
      ip,
    });

    this.setRefreshCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  @UseGuards(AuthGuard)
  @Post('logout-all')
  async logout(
    @User() user: AccessTokenPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ loggedOut: true }> {
    await this.authService.logoutAll(user.sub);

    res.clearCookie('refreshToken');

    return { loggedOut: true };
  }

  @Post('logout-session')
  async logoutSession(
    @RefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ loggedOut: true }> {
    await this.authService.logout(refreshToken);

    res.clearCookie('refreshToken');

    return { loggedOut: true };
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('JWT_REFRESH_EXPIRES_MS'),
    });
  }
}
