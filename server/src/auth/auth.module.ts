import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { SignOptions } from 'jsonwebtoken';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<SignOptions['expiresIn']>(
            'JWT_ACCESS_EXPIRES_IN',
          ),
          algorithm: 'HS256',
        },
      }),
    }),
  ],
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
  ],
})
export class AuthModule {}
