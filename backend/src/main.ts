import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions:{
        enableImplicitConversion: true,
      }
    })
  );

  app.setGlobalPrefix('Api');
  app.enableCors({
  origin: 'https://roquesoft.com:3000',
});
  await app.listen(Number(process.env.PORT));
}
bootstrap();
