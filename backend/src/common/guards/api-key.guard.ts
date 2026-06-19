import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard global que protege la API con un encabezado X-API-KEY estático
 * definido en la variable de entorno API_KEY.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // Preflight CORS del navegador no envía X-API-KEY; debe pasar sin autenticación.
    if (request.method === 'OPTIONS') {
      return true;
    }
    const providedKey = request.headers['x-api-key'];
    const expectedKey = this.configService.get<string>('API_KEY');

    if (!expectedKey) {
      throw new UnauthorizedException(
        'API Key no configurada en el servidor',
      );
    }

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException(
        'API Key inválida o no proporcionada',
      );
    }

    return true;
  }
}
