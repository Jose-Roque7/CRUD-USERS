import { Module } from '@nestjs/common';
import { JwtService } from './jwt.services'; // Asegúrate de importar JwtService
import { JwtStrategy } from './jwt.strategy'; // Importa JwtStrategy
import { JwtGuard } from '../guards/jwt/jwt.guard'; // Importa JwtGuard
import { Reflector } from '@nestjs/core';

@Module({
  providers: [JwtService, JwtStrategy, JwtGuard, Reflector ], // Proveedores
  exports: [JwtService, JwtGuard, JwtStrategy], // Exporta JwtService y JwtGuard si los necesitas en otros módulos
})
export class AuthModule {}
