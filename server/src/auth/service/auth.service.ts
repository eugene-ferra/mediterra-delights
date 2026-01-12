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
import { randomUUID } from 'crypto';
import { AccessTokenPayload } from 'src/common/types/access-token-payload.type';
import { SessionsService } from 'src/session/session.service';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
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

  async refresh(params: {
    refreshToken: string;
    userAgent?: string;
    ip?: string;
  }): Promise<UserTokens> {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.refreshJwt.verifyAsync<RefreshTokenPayload>(
        params.refreshToken,
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userIdStr = payload?.sub;
    const deviceId = payload?.deviceId;

    if (!userIdStr || !deviceId) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    let userId: Types.ObjectId;
    try {
      userId = new Types.ObjectId(userIdStr);
    } catch {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    const session = await this.sessionsService.validateSession({
      userId,
      deviceId,
      refreshToken: params.refreshToken,
    });

    if (!session) {
      await this.sessionsService.removeAllSessions(userId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (
      session.expiresAt &&
      new Date(session.expiresAt).getTime() < Date.now()
    ) {
      await this.sessionsService.removeSession(userId, deviceId);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.usersService.findById(userIdStr);
    if (!user) {
      await this.sessionsService.removeAllSessions(userId);
      throw new UnauthorizedException('User not found');
    }

    const newAccessToken = this.signAccessToken({
      _id: user.id,
      role: user.role,
    });
    const newRefreshToken = this.signRefreshToken(
      { _id: user.id, role: user.role },
      deviceId,
    );

    await this.sessionsService.upsertSession({
      userId: user.id,
      deviceId,
      refreshToken: newRefreshToken,
      userAgent: params.userAgent,
      ip: params.ip,
      expiresAt: new Date(Date.now() + this.getRefreshExpiresMs()),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    let payload: RefreshTokenPayload;

    try {
      payload =
        await this.refreshJwt.verifyAsync<RefreshTokenPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userIdStr = payload?.sub;
    const deviceId = payload?.deviceId;

    if (!userIdStr || !deviceId) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    let userId: Types.ObjectId;
    try {
      userId = new Types.ObjectId(userIdStr);
    } catch {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    await this.sessionsService.removeSession(userId, deviceId);
  }

  async logoutAll(userId: string): Promise<void> {
    let userObjId: Types.ObjectId;
    try {
      userObjId = new Types.ObjectId(userId);
    } catch {
      throw new UnauthorizedException('Invalid user id');
    }

    await this.sessionsService.removeAllSessions(userObjId);
  }
}
