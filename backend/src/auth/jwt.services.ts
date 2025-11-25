import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  // Firma el JWT con la clave secreta
  sign(payload: any): string {
    // Asegúrate de que la clave secreta esté definida
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    // Tiempo de expiración por defecto, en segundos (3600 segundos = 1 hora)
    const expiresIn = parseInt(process.env.JWT_EXPIRES_IN || '3600'); // Usar número (en segundos)

    // Definir opciones explícitas
    const options: SignOptions = {
      expiresIn: expiresIn,  // Ahora pasa un número
      algorithm: 'HS256',    // Algoritmo de firma
    };

    // Firma el token usando HS256 o cualquier algoritmo que desees
    return jwt.sign(payload, secretKey, options);
  }

  // Verifica la validez del token JWT
  verify(token: string) {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    return jwt.verify(token, secretKey);
  }
}
