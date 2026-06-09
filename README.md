# Construproformas

Backend API para la generación de proformas de **Construmétrica** — ingeniería civil. Mobile-first, SQLite, despliegue local y en NAS vía Docker.

## Estado del proyecto

| Área | Versión | Estado |
|------|---------|--------|
| Backend API (NestJS) | V1.1 / V1.2 | ✅ Completado |
| Frontend PWA | — | Pendiente |

## Documentación

- [Manual técnico completo](docs/MANUAL_TECNICO.md) — arquitectura, tecnologías, despliegue local vs Docker
- [Handoff al equipo](docs/HANDOFF_BACKEND.md) — qué está hecho, checklist, consideraciones para frontend/QA

## Inicio rápido

### Local (desarrollo)

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

API: `http://localhost:3000/api`  
Header requerido: `X-API-KEY: <valor de API_KEY en .env>`

### Docker

```bash
docker compose up -d --build
```

### Pruebas

```bash
cd backend
npm test                    # Unitarias (Jest)
.\scripts\test-integration.ps1   # Integración (PowerShell, servidor activo)
```

## Repositorio

https://github.com/RodARWx/ContruProformas
