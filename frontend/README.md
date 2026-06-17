# Construproformas — Frontend (PWA)

Aplicación web mobile-first para generar y gestionar proformas de Construmétrica. Consume la API NestJS del backend (`/api`) y funciona como PWA instalable con soporte offline para borradores.

## Requisitos

- Node.js 20+
- npm 10+
- Backend Construproformas en ejecución (por defecto `http://localhost:3000/api`)

## Configuración de entorno

Copie el archivo de ejemplo y ajuste los valores:

```bash
cp .env.example .env
```

Variables disponibles:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL base del API | `/api` (dev con proxy) o `http://localhost:3000/api` |
| `VITE_API_KEY` | Clave enviada en header `X-API-KEY` | `construproformas-dev-key` |
| `VITE_ACCESS_PIN` | PIN de acceso del lado del cliente (no es login del backend) | `1234` |

### Desarrollo local (recomendado)

Use `VITE_API_BASE_URL=/api`. Vite hace proxy a `http://localhost:3000` y evita problemas de CORS sin modificar el backend.

### Producción / LAN

Apunte `VITE_API_BASE_URL` al servidor real, por ejemplo:

```env
VITE_API_BASE_URL=http://192.168.1.50:3000/api
VITE_API_KEY=<clave-de-produccion>
VITE_ACCESS_PIN=<pin-interno>
```

> Las variables `VITE_*` se embeben en el build. No incluya secretos de producción en repositorios públicos.

## Desarrollo

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`, ingrese el PIN configurado y use la app.

Comandos útiles:

```bash
npm run lint    # ESLint
npm run build   # Build de producción + PWA
npm run preview # Servir dist/ localmente
```

## Build de producción

```bash
npm run build
```

Salida en `dist/`:

- `index.html` — SPA
- `assets/` — JS/CSS (incluye chunk separado de `xlsx` para importación Excel)
- `manifest.webmanifest` — PWA
- `sw.js` — Service worker (cache de interfaz)

Para previsualizar el build:

```bash
npm run preview
```

### Despliegue

Sirva el contenido de `dist/` con cualquier servidor estático (nginx, Caddy, NAS, etc.). Configure fallback a `index.html` para rutas del React Router.

**Nota:** Este repositorio no incluye cambios en el `docker-compose.yml` raíz ni en la carpeta `backend/`. Si se requiere contenedor dedicado para el frontend, debe añadirse como servicio aislado y coordinarse aparte.

## Funcionalidades principales

- Nueva proforma, edición y historial
- Catálogo de rubros con autocompletado
- Perfiles y clientes
- Exportar PDF/Excel, clonar
- Importar proforma anterior desde `.xlsx` institucional
- PWA instalable + borradores offline sincronizados con `POST /proformas/sync`

## Accesibilidad y marca

- Botones primarios usan **coral** con texto blanco (acento sobre fondo sólido).
- Enlaces y texto interactivo sobre fondos claros usan **wine** (`#550012`) con subrayado visible (no dependen solo de `:hover`).
- Navegación móvil con áreas táctiles mínimas (~48px).
- Estados `:focus-visible` en botones y enlaces para teclado.
- `prefers-reduced-motion` reduce animaciones.

## Checklist de pruebas finales (QA)

Ejecute en **móvil** (o DevTools responsive) y en **escritorio**.

### Acceso y navegación

- [ ] Pantalla `/acceso` acepta PIN correcto y rechaza PIN incorrecto
- [ ] Menú inferior (móvil) y sidebar (escritorio) navegan sin depender de hover
- [ ] Indicador de conexión muestra En línea / Sin conexión

### Flujo completo de proforma

- [ ] **Crear:** `/proformas/nueva` — ID sugerido, cabecera, cliente, perfil, IVA
- [ ] **Rubros:** autocompletado catálogo (≥3 caracteres) + línea manual + APU local (toggle por toque)
- [ ] **Previsualizar totales:** guardar borrador y ver subtotal/IVA/total del servidor
- [ ] **Guardar:** `POST /proformas` (nueva) o `PATCH` (edición de borrador)
- [ ] **Exportar:** desde historial, proforma pasa a EXPORTED y muestra rutas de archivos
- [ ] **Clonar:** plantilla en nueva proforma con ID sugerido
- [ ] **Importar:** `/proformas/importar` — subir `.xlsx` institucional, vista previa editable, guardar

### Offline / PWA

- [ ] `npm run build` + `npm run preview` — app instalable (manifest + service worker)
- [ ] Sin red: guardar borrador encola en IndexedDB y muestra toast
- [ ] Al reconectar: sincronización automática vía `POST /proformas/sync`
- [ ] Si falla un ítem: queda pendiente y permite **Reintentar** en el header
- [ ] Interfaz principal sigue usable offline (shell cacheada)

### Accesibilidad táctil y contraste

- [ ] Ninguna acción crítica requiere solo hover (botones/enlaces funcionan con toque)
- [ ] Enlaces visibles sin pasar el mouse (subrayado wine)
- [ ] Texto principal legible sobre fondo `#fafafa` / blanco
- [ ] Coral solo en botones con texto blanco, no como texto pequeño sobre fondo claro

### Validaciones

- [ ] Campos obligatorios muestran error inline + toast
- [ ] ID duplicado muestra advertencia 409
- [ ] Excel con formato incorrecto muestra toast de plantilla institucional
- [ ] PDF/OCR no está soportado (mensaje claro si se intenta otro formato)

## Estructura relevante

```
src/
├── components/     # UI y layout
├── context/        # App, borrador, sincronización offline
├── features/       # proformas, catálogo, perfiles
├── pages/          # Rutas por pantalla
├── lib/            # API, formato, toasts
└── types/          # Tipos compartidos
```

## API esperada

Todas las peticiones (excepto health) requieren:

```http
X-API-KEY: <VITE_API_KEY>
Content-Type: application/json
```

Los totales de proforma siempre deben mostrarse desde la respuesta del servidor, no como cálculo definitivo del cliente.
