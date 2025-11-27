import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // Usar ValidationPipe globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    })
  );

  // Configurar el prefijo global para las rutas
  app.setGlobalPrefix('api');

  // Habilitar CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    allowedHeaders: 'Content-Type,Authorization,x-api-key',  // Permite el header 'x-api-key'
    credentials: true,
  });

  // Escuchar en el puerto que viene de las variables de entorno, con un valor por defecto si no está definido
  const port = process.env.PORT || 5000;  // Si no se define en el .env, usará 5000
  await app.listen(Number(port));
}

bootstrap();
