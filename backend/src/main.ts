import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

/** Normaliza URL de origen (sin barra final). */
function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}

/**
 * Orígenes CORS permitidos.
 * Vacío o `*` → refleja el origen de cada petición (recomendado en Render/Railway).
 * Lista separada por comas → solo esos frontends (ej. https://contruproformas-web.onrender.com).
 */
function resolveCorsOrigin(): boolean | string | string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw || raw === '*') {
    return true;
  }
  const origins = raw.split(',').map(normalizeOrigin).filter(Boolean);
  if (origins.length === 0) {
    return true;
  }
  return origins.length === 1 ? origins[0] : origins;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todos los endpoints REST
  app.setGlobalPrefix('api');

  const corsOrigin = resolveCorsOrigin();
  // Siempre activo: el frontend en Render/Railway es otro dominio y el navegador exige CORS.
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY'],
  });
  console.log(
    'CORS habilitado para:',
    corsOrigin === true ? 'cualquier origen (reflect)' : corsOrigin,
  );

  // Validación automática de DTOs entrantes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro global para normalizar errores hacia el frontend
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = Number(process.env.PORT) || 3000;

  // Mensaje útil si alguien abre la URL raíz del backend (no es el frontend)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (_req: unknown, res: { json: (body: unknown) => void }) => {
    res.json({
      status: 'ok',
      service: 'construproformas-api',
      message: 'Esta URL es solo la API. Abra la app web en el dominio del frontend.',
      health: '/api/health',
    });
  });

  await app.listen(port);

  console.log(`Construproformas API escuchando en http://localhost:${port}/api`);
}

bootstrap();
