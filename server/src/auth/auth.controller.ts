import { Body, Controller, Ip, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';

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

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('JWT_REFRESH_EXPIRES_MS'),
    });
  }
}
