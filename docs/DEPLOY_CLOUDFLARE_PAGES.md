# Despliegue frontend en Cloudflare Pages

## Interfaz nueva (2025-2026): "Create application"

Cloudflare unificó Workers y Pages bajo **Create application**. Si solo ves `npx wrangler deploy`, probablemente estás creando un **Worker**, no un sitio **Pages** estático.

### Ruta correcta en el dashboard

1. Entra a [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) (menú lateral izquierdo).
2. Pulsa **Create application** (o **Create**).
3. Elige la pestaña o tarjeta **Pages** — **no** "Worker" ni plantilla con Wrangler.
4. Selecciona **Connect to Git** (conectar repositorio).
5. Autoriza GitHub y elige el repo `ContruProformas`.
6. En **Build configuration**:

| Campo | Valor |
|-------|-------|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| **Deploy command** | **VACIO** (borra `npx wrangler deploy`) |

7. **Save and Deploy**.

### Si ya creaste un proyecto Worker por error

- Opción A: Crear un proyecto **nuevo** tipo **Pages** con Git (recomendado para esta PWA).
- Opción B: En el proyecto existente → **Settings** → **Build** → borrar el Deploy command y verificar que el output sea `dist`.

### Enlace directo útil

- Lista de proyectos: `https://dash.cloudflare.com/` → cuenta → **Workers & Pages**
- Documentación oficial: [Pages — Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)

---

## Error común: `Invalid _redirects` + `npx wrangler deploy`

Cloudflare tiene **dos modos distintos**:

| Modo | Deploy command | SPA routing |
|------|----------------|-------------|
| **Cloudflare Pages (recomendado)** | *(vacío)* | Regla en dashboard o `_redirects` |
| **Workers + Wrangler** | `npx wrangler deploy` | Solo `wrangler.jsonc` assets SPA — **no** usar `_redirects` |

Mezclar `npx wrangler deploy` + `_redirects` provoca:

```
Infinite loop detected in this rule [code: 100324]
```

Si usas **Deploy command vacío** (modo Pages estático), el archivo `frontend/public/_redirects` incluido en el build configura el SPA automáticamente. **No** uses `_redirects` si volviste a poner `npx wrangler deploy`.

---

## Configuración correcta (Cloudflare Pages estático)

1. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Repositorio: `ContruProformas`
3. **Root directory:** `frontend`
4. **Build command:** `npm run build`
5. **Deploy command:** *(dejar VACÍO — borrar `npx wrangler deploy`)*
6. **Build output directory:** `dist`

### Variables de entorno (Production)

| Variable | Valor ejemplo |
|----------|---------------|
| `VITE_API_BASE_URL` | `https://construproformas-api-production.up.railway.app` |
| `VITE_API_KEY` | *(igual que `API_KEY` en Railway)* |
| `VITE_ACCESS_PIN` | `2585` |

> Puedes omitir `https://` y `/api`; el script `write-env-config.mjs` los añade al build.

### SPA (React Router) — paso 3

En muchos proyectos de Cloudflare Pages **no aparece** una sección "Redirects" en Settings. No es obligatorio configurarla manualmente: el build copia `frontend/public/_redirects` a `dist/` con:

```
/*    /index.html   200
```

Tras hacer push y redeploy, las rutas como `/proformas` funcionan al recargar la página.

Si tu panel sí muestra **Redirects** o **Single Page Application**, puedes añadir la misma regla allí como respaldo.

### Nombre de la PWA (punto 3 — alcance V2)

El nombre correcto es **Construproformas** (con **s**). En el código ya está en `index.html`, manifest PWA y meta `apple-mobile-web-app-title`.

Si al instalar la PWA aún aparece **contruproformas** (sin **s**), el origen suele ser el **nombre del proyecto** en Cloudflare (`contruproformas.pages.dev`). Para corregirlo:

1. Cloudflare Dashboard → **Workers & Pages** → proyecto → **Settings** → **General** → renombrar a `construproformas` si el panel lo permite, **o**
2. Crear un proyecto Pages nuevo con nombre correcto y apuntar el mismo repo, **o**
3. Aceptar la URL `.pages.dev` actual pero confiar en el manifest (nombre visible al instalar debería ser Construproformas tras redeploy).

Actualice `CORS_ORIGIN` en Railway si cambia el dominio del frontend.

---

## Tras el deploy

1. Copia la URL del frontend (ej. `https://construproformas.pages.dev`)
2. En **Railway** → backend → Variables:

```env
CORS_ORIGIN=https://construproformas.pages.dev
```

3. Redeploy backend si hace falta.
4. Abre el frontend, ingresa PIN, prueba listar perfiles.

---

## Verificación rápida

```powershell
# Backend
Invoke-RestMethod https://construproformas-api-production.up.railway.app/api/health

# Frontend: abrir en navegador y revisar consola (sin errores CORS)
```
