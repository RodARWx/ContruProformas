# Handoff — Backend Construproformas (Persona 4)

Documento para el equipo: qué está entregado, qué deben considerar frontend, QA y DevOps.

---

## 1. ¿Está finalizado el backend?

**Sí, para el alcance V1.1 y V1.2 del cronograma.**

| Requerimiento | Estado |
|---------------|--------|
| Módulos CRUD: profiles, customers, catalog | ✅ |
| Módulo proformas (CRUD + reglas de negocio) | ✅ |
| Recálculo estricto de totales | ✅ |
| next-id, clone, sync offline | ✅ |
| import-preview (Excel → pantalla) | ✅ |
| Export PDF + Excel institucional | ✅ |
| Seguridad X-API-KEY (V1.1) | ✅ |
| Tests unitarios calculador (V1.2) | ✅ |
| Seed Profile/Customer id=1 | ✅ |
| Docker + volumen SQLite NAS | ✅ |
| Documentación técnica | ✅ |

**Fuera de alcance actual (siguiente fase):** frontend PWA, tests e2e automatizados, migraciones formales, autenticación multi-usuario, endpoint de descarga de archivos exportados.

---

## 2. Estado de pruebas (confirmado)

| Tipo | Resultado |
|------|-----------|
| Unitarias (`npm test`) | ✅ 5/5 PASS |
| Integración local (manual + script) | ✅ |
| Docker compose + health + API | ✅ |
| Exportación archivos en volumen | ✅ |

---

## 3. Lo que el frontend debe implementar

### 3.1 Header obligatorio

Todas las peticiones (excepto health):

```http
X-API-KEY: <valor acordado con DevOps>
Content-Type: application/json
```

En desarrollo: `construproformas-dev-key` (cambiar en producción).

### 3.2 Base URL

| Entorno | URL |
|---------|-----|
| Local dev | `http://localhost:3000/api` |
| Docker local | `http://localhost:3000/api` |
| NAS / LAN | `http://<IP-NAS>:3000/api` |

### 3.3 Flujos ya soportados por la API

1. **Nueva proforma:** `GET next-id` → formulario → `POST /proformas`
2. **Autocompletado rubros:** `GET /catalog/search?q=...`
3. **Import Excel:** parsear en cliente → `POST /import-preview` → mostrar totales → `POST /proformas`
4. **Offline:** acumular en IndexedDB → `POST /sync` al reconectar
5. **Exportar:** `POST /proformas/:id/export` → usar paths retornados (o servir descarga en fase 2)
6. **Clonar:** `POST /proformas/:id/clone`

### 3.4 No enviar totales “confiables”

El backend **recalcula** subtotal, IVA y totalGeneral. El frontend debe mostrar la respuesta del servidor, no sus propios cálculos como verdad final.

### 3.5 IDs de proforma

- Sugeridos por el servidor pero editables por el usuario
- Error `409` = ID ya existe → pedir otro o usar `next-id`

### 3.6 CORS

Aún **no** está configurado en `main.ts`. Al integrar PWA desde otro origen (ej. `localhost:5173`), avisar a backend para añadir:

```typescript
app.enableCors({ origin: ['http://localhost:5173'], credentials: true });
```

---

## 4. Checklist para QA

```
[ ] Health GET /api/health sin API Key → 200
[ ] Cualquier ruta sin X-API-KEY → 401
[ ] X-API-KEY incorrecta → 401
[ ] Crear proforma con appliesIva=true → IVA 15% correcto
[ ] Crear proforma con appliesIva=false → iva=0
[ ] Cantidad/costo negativos → 400 validación
[ ] DELETE profile con proformas → 409
[ ] Sync lote mixto (nueva + actualizar borrador) → results[]
[ ] Export → archivos en exports/ + status EXPORTED
[ ] Proforma EXPORTED no editable → 400
[ ] Docker: reiniciar contenedor → datos persisten en volumen
[ ] import-preview totales = create con mismos rubros
```

---

## 5. Checklist para DevOps / NAS

```
[ ] Cambiar API_KEY en .env de producción (no usar dev-key)
[ ] Confirmar puerto API_PORT en firewall LAN
[ ] Backup periódico volumen sqlite-data o /app/data/
[ ] Monitorear healthcheck Docker
[ ] Planificar migrate desde DB_SYNCHRONIZE=true a migraciones
[ ] HTTPS reverse proxy (nginx/Traefik) si expone fuera de LAN
```

---

## 6. Datos semilla

Al primer arranque se insertan automáticamente:

| Entidad | id | Uso |
|---------|-----|-----|
| Profile | 1 | Ing. Carlos Métrica (pruebas) |
| Customer | 1 | Constructora Andina S.A. |

Toda proforma de prueba debe usar `profileId: 1` y `customerId: 1` hasta que existan más registros.

---

## 7. Errores comunes (ya vistos en pruebas)

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `EADDRINUSE :3000` | Servidor local + Docker o doble instancia | `taskkill /PID` o `docker compose down` |
| `URI no válido` PowerShell | Variables `$base` no definidas | Definir antes de Invoke-RestMethod |
| `409 ID ya en uso` | Reutilizar CM-PROF-1 | Usar `GET next-id` |
| Script PS falla en `&` | PowerShell parsea URL | Usar script actualizado en `scripts/` |

---

## 8. Archivos clave para revisión de código

| Archivo | Responsabilidad |
|---------|-----------------|
| `proformas/helpers/proforma-calculator.helper.ts` | Núcleo matemático |
| `proformas/proformas.service.ts` | Reglas de negocio |
| `common/guards/api-key.guard.ts` | Seguridad |
| `export/export.service.ts` | Orquestación PDF/Excel |
| `config/database.config.ts` | SQLite + rutas |
| `database/database-seed.service.ts` | Datos iniciales |

---

## 9. Próximos pasos sugeridos del equipo

1. **Frontend:** consumir API con interceptor Axios/fetch para `X-API-KEY`
2. **Frontend:** pantallas según flujos §3.3
3. **Backend (opcional fase 2):** CORS + endpoint descarga exports + e2e tests
4. **QA:** ejecutar checklist §4 contra Docker en NAS
5. **DevOps:** desplegar compose en NAS con API_KEY de producción

---

## 10. Repositorio

**GitHub:** https://github.com/RodARWx/ContruProformas  

Clonar:

```bash
git clone https://github.com/RodARWx/ContruProformas.git
cd ContruProformas/backend
cp .env.example .env
npm install
npm run start:dev
```
