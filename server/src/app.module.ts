import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { CategoryModule } from './catalog/categories/category.module';
import { ProductModule } from './catalog/products/products.module';
import { ReviewModule } from './reviews/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || ''),
    JwtModule.registerAsync({
      global: true,
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
    AuthModule,
    CategoryModule,
    ProductModule,
    ReviewModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
