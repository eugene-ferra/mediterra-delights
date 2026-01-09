import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { SignOptions } from 'jsonwebtoken';
import { AuthController } from './auth.controller';
import { AuthService } from './service/auth.service';
import { RefreshSessionsService } from './service/refresh-session.service';
import { UsersModule } from 'src/users/users.module';
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
