import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '../../auth/jwt.services';  // Importa el servicio JwtService
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,  // Usa JwtService aquí
    private readonly reflector: Reflector,  
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();  // Obtén la solicitud (request)
    const token = request.headers['authorization']?.split(' ')[1];  // Extrae el token de la cabecera Authorization
    
    if (!token) {
      return false;  // Si no hay token, la autenticación falla
    }

    try {
      // Verifica el token usando el servicio JwtService
      const payload = this.jwtService.verify(token);  // Verifica si es válido o si ha expirado

      // Si la validación pasa, asigna el usuario a la solicitud (request)
      request.user = payload;

      return true;  // Token válido, la autenticación pasa
    } catch (error) {
      // Si la verificación falla, la autenticación falla
      return false;  
    }
  }
}
