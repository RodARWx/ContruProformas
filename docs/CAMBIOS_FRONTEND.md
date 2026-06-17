# Cambios Frontend (Fases 1-11)

Este documento resume los cambios implementados en el frontend (`frontend/`) para que el equipo identifique rapidamente el alcance entregado.

## Resumen ejecutivo

- Se creo el frontend completo con React + TypeScript + Vite, UI mobile-first y rutas protegidas por PIN local.
- Se implementaron los modulos funcionales de proformas, catalogo y perfiles conectados a la API backend.
- Se implemento importacion desde Excel (`.xlsx`) con vista previa editable y validacion de plantilla institucional.
- Se configuro PWA instalable con service worker y soporte offline.
- Se agrego sincronizacion de borradores offline via `POST /proformas/sync`.
- Se hicieron ajustes de accesibilidad, contraste y experiencia tactil para cierre de QA.

## Cambios por fase

### Fase 1 - Inicializacion
- Creacion de proyecto Vite + React + TypeScript en `frontend/`.
- Configuracion base de estilos y estructura de carpetas.
- Cliente API base en `src/lib/api.ts`.

### Fase 2 - Sistema de diseno
- Componentes UI reutilizables (`Button`, `Input`, `Select`, `TextArea`, `Table`, `Switch`, `Card`).
- Layout base (`AppShell`, `AppHeader`, `SidebarNav`, `BottomNav`).

### Fase 3 - Navegacion y acceso
- Rutas protegidas con `RequireAccess`.
- Pantalla de acceso por PIN local.

### Fase 4 - Catalogo
- CRUD de rubros.
- `RubroAutocomplete` con debounce y busqueda remota.

### Fase 5 - Cabecera proforma
- Formulario de cabecera con `next-id`, cliente, perfil, fecha, notas e IVA.

### Fase 6 - Detalle rubros
- Tabla editable de rubros con APU local auxiliar.

### Fase 7 - Guardar/editar
- Guardado de borradores (`POST /proformas`, `PATCH /proformas/:id`).
- Vista de totales devueltos por backend.

### Fase 8 - Historial, exportar, clonar
- Historial con filtros.
- Exportacion PDF/Excel.
- Clonacion de proforma.

### Fase 9 - Importacion desde Excel
- Pantalla `Importar proforma anterior`.
- Parser de Excel institucional y mapeo a `import-preview`.
- Vista previa editable antes de guardar.
- Mensajes claros cuando el formato no coincide con la plantilla.

### Fase 10 - PWA y offline
- PWA con `vite-plugin-pwa` (manifest, service worker, instalable).
- IndexedDB con `idb` para borradores locales.
- Indicador de estado online/offline en header.
- Sync automatico al reconectar + reintento manual.

### Fase 11 - QA final, accesibilidad y build
- Ajustes de contraste y enlaces visibles sin depender solo de hover.
- Mejoras tactiles (areas minimas de botones/navegacion).
- Build de produccion validado con `npm run build`.
- Documentacion completa en `frontend/README.md`.

## Archivos clave agregados/actualizados

- `frontend/README.md`
- `frontend/vite.config.ts`
- `frontend/src/context/SyncContext.tsx`
- `frontend/src/features/proformas/offlineDraftsDb.ts`
- `frontend/src/features/proformas/ImportProformaPage.tsx`
- `frontend/src/features/proformas/excelParser.ts`
- `frontend/src/components/layout/ConnectionStatusBadge.tsx`
- `frontend/src/types/sync.ts`
- `frontend/public/construmetrica-pwa.svg`

## Notas importantes

- No se hicieron cambios dentro de `backend/`.
- No se modifico `docker-compose.yml` raiz.
- Para detalles operativos (env, desarrollo, build, QA checklist), revisar `frontend/README.md`.

