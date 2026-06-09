# Manual técnico — Construproformas Backend

**Versión del documento:** 1.0  
**Alcance:** Backend API V1.1 y V1.2 (cronograma)  
**Empresa:** Construmétrica — ingeniería civil  

---

## 1. Resumen ejecutivo

Construproformas es una API REST construida con **NestJS** y **TypeScript** que centraliza la gestión de proformas de obra: perfiles emisores, clientes, catálogo de rubros, cálculo estricto de totales, sincronización offline (PWA), importación desde Excel (preview), exportación a PDF/Excel y protección básica por API Key.

La persistencia usa **SQLite** en un archivo único, ideal para despliegue en **NAS** con volumen Docker persistente.

---

## 2. Stack tecnológico y justificación

| Tecnología | Versión / uso | Justificación |
|------------|---------------|---------------|
| **NestJS** | 10.x | Arquitectura modular nativa (módulos, DI, guards, pipes). Estándar enterprise en Node.js/TypeScript. |
| **TypeScript** | 5.x | Tipado estático, DTOs seguros, mantenibilidad del equipo. |
| **TypeORM** | 0.3.x | ORM maduro con soporte SQLite; entidades declarativas y relaciones. |
| **better-sqlite3** | 11.x | Driver SQLite síncrono y performante para archivo local/NAS. |
| **SQLite** | archivo `.db` | Sin servidor DB separado; bajo costo operativo; ideal para NAS y red local. |
| **class-validator / class-transformer** | — | Validación declarativa en DTOs; coherente con NestJS ValidationPipe. |
| **exceljs** | 4.x | Generación de `.xlsx` editables con formato institucional. |
| **pdfkit** | 0.19.x | PDF ligero sin Chromium; apto para contenedores Alpine en NAS. |
| **Jest** | 29.x | Pruebas unitarias del núcleo de cálculo financiero. |
| **Docker / Compose** | — | Empaquetado reproducible; volumen persistente para datos. |

**Por qué no PostgreSQL/MySQL:** el requisito del proyecto es entorno local dockerizado en NAS con mínima operación; SQLite cumple integridad relacional sin otro servicio.

**Por qué no Prisma:** se adoptó TypeORM por alineación directa con entidades NestJS y relaciones ManyToOne/OneToMany del modelo de dominio.

---

## 3. Arquitectura del sistema

### 3.1 Vista de capas

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente (PWA / Postman)                 │
│              Header: X-API-KEY  |  JSON REST               │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Capa HTTP (Controllers)                                 │
│  Prefijo global: /api  |  ValidationPipe  |  ApiKeyGuard │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Capa de negocio (Services)                              │
│  Recálculo totales | Sync | Clone | Export | CRUD        │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Capa de persistencia (TypeORM Repositories + Entities)  │
│  SQLite: construproformas.db                             │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Sistema de archivos                                     │
│  /data/construproformas.db  |  /data/exports/*.pdf|xlsx  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Jerarquía de módulos NestJS

```
AppModule
├── ConfigModule (global)          → .env, IVA_RATE, API_KEY, DATABASE_PATH
├── TypeOrmModule                  → SQLite + synchronize (dev/Docker inicial)
├── DatabaseModule                 → Seed automático Profile/Customer id=1
├── ProfilesModule                 → CRUD perfiles emisores
├── CustomersModule                → CRUD clientes (RUC único)
├── CatalogModule                  → CRUD rubros + búsqueda LIKE
├── ProformasModule                → Core: CRUD, next-id, clone, sync, import-preview
├── ExportModule                   → PDF + Excel, marca EXPORTED
├── ApiKeyGuard (APP_GUARD)        → Seguridad V1.1
└── GlobalExceptionFilter          → Errores JSON uniformes
```

Cada módulo de dominio sigue el patrón:

```
módulo/
├── entities/          → TypeORM
├── dto/               → class-validator
├── *.controller.ts    → Rutas REST
├── *.service.ts       → Reglas de negocio
└── *.module.ts        → Wiring TypeORM + exports
```

### 3.3 Modelo de datos relacional

```
Profile (1) ──< Proforma >── (1) Customer
                    │
                    └──< ProformaDetail (cascade delete/update)

ItemCatalog          → independiente (autocompletado; no FK en detalle)
```

| Entidad | PK | Campos clave |
|---------|-----|--------------|
| Profile | id (auto) | nombre, cargo, registroSenescyt, telefono, correo |
| Customer | id (auto) | nombreCliente, rucCedula (unique), direccion... |
| ItemCatalog | id (auto) | codigoSugerido, descripcion (index), unidad, costoUnitario |
| Proforma | idProforma (string) | totales, appliesIva, status DRAFT/EXPORTED |
| ProformaDetail | id (auto) | cantidad, costoUnitario, total (recalculado) |

---

## 4. Reglas de negocio críticas

### 4.1 Recálculo estricto de totales

Implementado en `proformas/helpers/proforma-calculator.helper.ts`:

- `total línea = cantidad × costoUnitario` (redondeo 2 decimales)
- `subtotal = Σ totales línea`
- `iva = subtotal × IVA_RATE` si `appliesIva === true`, else `0`
- `totalGeneral = subtotal + iva`

**Nunca** se confían totales enviados por el cliente en create/update/sync/import-preview.

### 4.2 ID secuencial de proforma

- `GET /proformas/next-id` → sugiere siguiente ID (ej. `CM-PROF-86`)
- `POST /proformas` acepta ID manual; rechaza duplicados (`409`)
- Proformas `EXPORTED` bloquean reutilización de ID

### 4.3 Integridad referencial

- No se elimina Profile/Customer si tienen proformas asociadas
- create/sync valida existencia de `profileId` y `customerId`

### 4.4 Exportación

- Archivos en `{dirname(DATABASE_PATH)}/exports/`
- Nombre: `[ID Proforma] - [Nombre Proyecto].pdf|.xlsx` (caracteres inválidos sanitizados)
- Tras exportar → `status = EXPORTED`

### 4.5 Seguridad (V1.1)

- Guard global `ApiKeyGuard`
- Header: `X-API-KEY` = valor de `API_KEY` en entorno
- Excepción: `GET /api/health` (Docker healthcheck)

---

## 5. API — Endpoints principales

Base URL: `http://<host>:3000/api`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Salud (público) |
| CRUD | `/profiles`, `/customers`, `/catalog` | Maestros |
| GET | `/catalog/search?q=&limit=` | Autocompletado LIKE |
| GET | `/proformas/next-id` | Siguiente ID |
| POST | `/proformas/import-preview` | Preview import Excel |
| POST | `/proformas` | Crear |
| PATCH | `/proformas/:id` | Editar borrador |
| POST | `/proformas/:id/clone` | Clonar |
| POST | `/proformas/sync` | Lote offline |
| POST | `/proformas/:id/export` | PDF + Excel |

Respuesta de error estándar:

```json
{
  "statusCode": 401,
  "message": "API Key inválida o no proporcionada",
  "error": "Unauthorized",
  "timestamp": "...",
  "path": "/api/profiles"
}
```

---

## 6. Variables de entorno

### Backend (`backend/.env`)

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `PORT` | `3000` | Puerto HTTP |
| `DATABASE_PATH` | `../data/construproformas.db` | Ruta archivo SQLite |
| `DB_SYNCHRONIZE` | `true` | Auto-esquema (dev/Docker; migraciones futuras en prod) |
| `IVA_RATE` | `0.15` | Tasa IVA Ecuador |
| `API_KEY` | `***` | Clave estática header X-API-KEY |

### Raíz (`.env` para Docker Compose)

| Variable | Descripción |
|----------|-------------|
| `API_PORT` | Puerto host → contenedor |
| `IVA_RATE` | Passthrough al contenedor |
| `API_KEY` | Passthrough al contenedor |

---

## 7. Ejecución local vs Docker

### 7.1 Local (`npm run start:dev`)

| Aspecto | Comportamiento |
|---------|----------------|
| **Propósito** | Desarrollo, debug, hot-reload |
| **NODE_ENV** | development (implícito) |
| **Base de datos** | `data/construproformas.db` relativa al proyecto |
| **Synchronize** | `true` si `DB_SYNCHRONIZE=true` |
| **Logs SQL** | Activos |
| **Código** | TypeScript directo con watch |

```powershell
cd backend
cp .env.example .env
npm install
npm run start:dev
```

### 7.2 Docker (`docker compose up`)

| Aspecto | Comportamiento |
|---------|----------------|
| **Propósito** | Producción NAS, entorno reproducible |
| **NODE_ENV** | `production` |
| **Base de datos** | `/app/data/construproformas.db` en volumen `sqlite-data` |
| **Imagen** | Multi-stage: build + runner Alpine |
| **Healthcheck** | `curl /api/health` cada 30s |
| **Persistencia** | Volumen Docker sobrevive a `docker compose down` |

```powershell
cd ConstruProformas
docker compose up -d --build
```

### 7.3 Diferencias clave

| | Local | Docker |
|---|-------|--------|
| Hot reload | ✅ | ❌ (rebuild necesario) |
| Datos | `./data/` en disco host | Volumen Docker `sqlite-data` |
| Dependencias nativas | Instaladas en Windows | Compiladas en Linux Alpine |
| API Key / IVA | `backend/.env` | `.env` raíz → compose |
| Puerto ocupado | Común si queda instancia previa | Mismo (mapear `API_PORT`) |

**Importante:** no ejecutar `npm run start:dev` y Docker simultáneamente en el mismo puerto 3000.

---

## 8. Pruebas

### 8.1 Unitarias (Jest)

```bash
cd backend
npm test
```

Cubre: `proforma-calculator.helper.spec.ts` (5 tests — redondeo, subtotal, IVA on/off).

### 8.2 Integración manual

Script: `backend/scripts/test-integration.ps1` (servidor activo).

Checklist validado por el equipo:

- [x] Health sin API Key
- [x] 401 sin X-API-KEY
- [x] CRUD maestros + búsqueda catálogo
- [x] next-id, import-preview, create, clone, sync
- [x] Export PDF/Excel en `data/exports/`
- [x] Docker compose + volumen persistente

---

## 9. Estructura de directorios

```
ConstruProformas/
├── docker-compose.yml
├── .env.example              → plantilla raíz (crear .env local)
├── data/                     → SQLite + exports (local, gitignored)
├── docs/
│   ├── MANUAL_TECNICO.md
│   └── HANDOFF_BACKEND.md
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── .env.example
    ├── scripts/
    │   └── test-integration.ps1
    └── src/
        ├── main.ts
        ├── app.module.ts
        ├── config/
        ├── common/           → guards, filters, decorators
        ├── database/         → seed
        ├── profiles/
        ├── customers/
        ├── catalog/
        ├── proformas/
        └── export/
```

---

## 10. Decisiones técnicas pendientes (post-V1.2)

| Tema | Estado actual | Recomendación futura |
|------|---------------|----------------------|
| Migraciones DB | `synchronize: true` | TypeORM migrations en producción NAS |
| Auth | API Key estática | JWT/OAuth si hay usuarios múltiples |
| Tests e2e | Manuales + script PS | Supertest `test:e2e` |
| Descarga archivos | Solo path en JSON | `GET /exports/:filename` streaming |
| CORS | No configurado | Habilitar origen PWA en `main.ts` |

---

## 11. Contacto y convenciones

- Prefijo API: `/api`
- Idioma comentarios código: español
- Formato fechas proforma: `YYYY-MM-DD` (ISO date)
- Moneda: USD, 2 decimales, locale `es-EC` en exportaciones
