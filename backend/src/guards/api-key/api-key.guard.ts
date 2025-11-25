import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    const apiKey = request.headers['x-api-key']; // Busca la API key en los headers

    if (!apiKey || apiKey !== String(process.env.API_KEY)) {  // Compara con la API Key almacenada en el entorno
      throw new UnauthorizedException('API key is missing or invalid');
    }
    
    return true;
  }
}
