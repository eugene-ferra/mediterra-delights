import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import {
  RefreshTokenPayload,
  UserPayload,
  UserTokens,
} from '../types/auth-payload.types';
import { RefreshSessionsService } from './refresh-session.service';
import { randomUUID } from 'crypto';
import { AccessTokenPayload } from 'src/сommon/types/access-token-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: RefreshSessionsService,
    private readonly accessJwt: JwtService,
    @Inject('REFRESH_JWT') private readonly refreshJwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private getRefreshExpiresMs(): number {
    const raw = this.config.get<string>('JWT_REFRESH_EXPIRES_MS');
    const n = raw ? Number(raw) : NaN;
    if (!Number.isFinite(n)) return 30 * 24 * 60 * 60 * 1000;
    return n;
  }

  private signAccessToken(user: UserPayload): string {
    const payload: AccessTokenPayload = {
      sub: String(user._id),
      role: user.role,
    };
    return this.accessJwt.sign(payload);
  }

  private signRefreshToken(user: UserPayload, deviceId: string): string {
    const payload: RefreshTokenPayload = {
      sub: String(user._id),
      deviceId,
    };
    return this.refreshJwt.sign(payload);
  }

  async register(params: {
    dto: RegisterDto;
    userAgent: string;
    ip: string;
  }): Promise<UserTokens> {
    const existing = await this.usersService.findByEmail(params.dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const created = await this.usersService.create(params.dto);

    const deviceId = randomUUID();

    const accessToken = this.signAccessToken({
      _id: created.id,
      role: created.role,
    });

    const refreshToken = this.signRefreshToken(
      { _id: created.id, role: created.role },
      deviceId,
    );

    await this.sessionsService.upsertSession({
      userId: created.id,
      deviceId: deviceId,
      refreshToken,
      userAgent: params.userAgent,
      ip: params.ip,
      expiresAt: new Date(Date.now() + this.getRefreshExpiresMs()),
    });

    return { accessToken, refreshToken };
  }

  async login(params: {
    dto: LoginDto;
    userAgent?: string;
    ip?: string;
  }): Promise<UserTokens> {
    const userWithPass = await this.usersService.findByEmailWithPassword(
      params.dto.email,
    );

    if (!userWithPass || !userWithPass.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await bcrypt.compare(
      params.dto.password,
      (userWithPass as any).password as string,
    );
    if (!ok) throw new UnauthorizedException('Invalid email or password');

    const deviceId = randomUUID();

    const accessToken = this.signAccessToken({
      _id: userWithPass.id,
      role: userWithPass.role,
    });
    const refreshToken = this.signRefreshToken(
      {
        _id: userWithPass.id,
        role: userWithPass.role,
      },
      deviceId,
    );

    await this.sessionsService.upsertSession({
      userId: userWithPass.id,
      deviceId,
      refreshToken,
      userAgent: params.userAgent,
      ip: params.ip,
      expiresAt: new Date(Date.now() + this.getRefreshExpiresMs()),
    });

    return { accessToken, refreshToken };
  }
}
