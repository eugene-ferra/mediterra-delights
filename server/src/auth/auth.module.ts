import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { SignOptions } from 'jsonwebtoken';
import { AuthController } from './auth.controller';
import { AuthService } from './service/auth.service';
import { RefreshSessionsService } from './service/refresh-session.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshSession,
  RefreshSessionSchema,
} from './schema/refresh-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshSession.name, schema: RefreshSessionSchema },
    ]),
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
    UsersModule,
  ],
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
    RefreshSessionsService,
  ],
})
export class AuthModule {}
