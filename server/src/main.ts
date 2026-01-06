import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

function formatErrors(errors: ValidationError[]) {
  return errors.map((err) => {
    const constraints = err.constraints;
    const field = err.property;

    return {
      field,
      message: constraints ? Object.values(constraints)[0] : 'Invalid value',
    };
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException({
          err_data: formatErrors(errors),
          error: 'Bad Request',
          statusCode: 400,
        });
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
