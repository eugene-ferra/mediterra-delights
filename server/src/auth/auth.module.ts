import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { SignOptions } from 'jsonwebtoken';
import { AuthController } from './auth.controller';
import { AuthService } from './service/auth.service';
import { UsersModule } from 'src/users/users.module';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [ConfigModule, SessionModule, UsersModule],
  controllers: [AuthController],
  providers: [
    {
      provide: 'REFRESH_JWT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new JwtService({
          secret: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          signOptions: {
            expiresIn: config.get<SignOptions['expiresIn']>(
              'JWT_REFRESH_EXPIRES_IN',
            ),
            algorithm: 'HS256',
          },
        }),
    },
    AuthService,
  ],
})
export class AuthModule {}
