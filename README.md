# Construproformas

Plataforma para la generación de proformas de **Construmétrica** — ingeniería civil.
Incluye backend API (NestJS) y frontend web mobile-first/PWA (React + Vite), con SQLite y despliegue local o en NAS vía Docker.

## Estado del proyecto

| Área | Versión | Estado |
|------|---------|--------|
| Backend API (NestJS) | V1.1 / V1.2 | ✅ Completado |
| Frontend Web/PWA | Fases 1-11 | ✅ Completado |

## Documentación

- [Manual técnico completo](docs/MANUAL_TECNICO.md) — arquitectura, tecnologías, despliegue local vs Docker
- [Handoff al equipo](docs/HANDOFF_BACKEND.md) — qué está hecho, checklist, consideraciones para frontend/QA
- [Cambios de frontend](docs/CAMBIOS_FRONTEND.md) — resumen funcional y técnico de lo implementado (Fases 1-11)
- [Guía de frontend](frontend/README.md) — configuración `.env`, desarrollo, build y checklist QA final

## Estructura del repositorio

- `backend/` — API NestJS + SQLite.
- `frontend/` — aplicación React/Vite (PWA, importación Excel, modo offline).
- `docs/` — documentación técnica y handoff del proyecto.

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

## Frontend (rápido)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Build producción frontend:

```bash
cd frontend
npm run build
```

### Pruebas

```bash
cd backend
npm test                    # Unitarias (Jest)
.\scripts\test-integration.ps1   # Integración (PowerShell, servidor activo)
```

## Repositorio

https://github.com/RodARWx/ContruProformas
