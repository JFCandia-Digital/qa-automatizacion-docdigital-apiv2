# qa-automatizacion-docdigital-apiv2

Automatización QA de regresión — **DocDigital APIv2**.

Suite de pruebas de API (endpoints vigentes) construida con Cucumber + TypeScript + Axios,
tomando como referencia de estilo/cobertura la suite de APIv3, adaptada al contrato de APIv2.

## Stack
- Node.js
- Cucumber (`@cucumber/cucumber`)
- TypeScript (vía `ts-node`)
- Axios

## Requisitos
- Node.js 18+ (probado con Node 22).
- Acceso de red al ambiente de la API (por defecto `https://api-demodoc.digital.gob.cl/api`).

## Setup
```bash
npm install
cp .env.example .env      # en Windows PowerShell: Copy-Item .env.example .env
```

Completa el archivo `.env` (no se sube al repositorio; está en `.gitignore`). Hay dos vías de autenticación:

- **Opción A — Bearer manual**: pega en `ACCESS_TOKEN` un token ya emitido
  (por ejemplo, desde Swagger → *Authorize*). Es la vía más rápida.
- **Opción B — OAuth (client_credentials)**: completa `CLIENT_ID_PDI` y `CLIENT_SECRET_PDI`
  para obtener el token automáticamente vía `POST /oauth/token` usando el step
  `que solicito un token de acceso con el cliente "..." y el secret "..."`.

> Nota: los tokens de esta API son de corta duración (~1 h). Si un escenario positivo
> devuelve 401, probablemente el token expiró: renuévalo en `.env`.

```env
API_BASEURL=https://api-demodoc.digital.gob.cl/api
ACCESS_TOKEN=            # Opción A
CLIENT_ID_PDI=          # Opción B
CLIENT_SECRET_PDI=      # Opción B
```

## Ejecución

```bash
npm run smoke        # health-check (casos negativos de auth, pasan sin credenciales)
npm run negativo     # todos los casos negativos (401), no requieren token válido
npm run apiTest      # toda la suite (@API)

# por área
npm run tipos            # E05 Tipos (documentos + visaciones)
npm run tiposDocumentos  # solo GET /tipos/documentos/
npm run tiposVisaciones  # solo GET /tipos/visaciones/
npm run entidades        # E02 Entidades (token + listado con filtros/paginación)
npm run usuarios         # E03 Usuarios (listado con filtros/paginación)
```

Se genera un reporte HTML en `reports/report.html`.

## Cómo están organizados los tests

- `@Negativo` — validaciones de autenticación (token inválido/expirado/nulo → **401**).
  Se ejecutan en verde **sin credenciales** contra la API real.
- `@RequiereCredenciales` — escenarios positivos (200) y validación de parámetros (400).
  Requieren un token válido en `.env` (Opción A o B) para pasar en verde.
- `@Smoke` — subconjunto rápido para verificar que el framework y la conectividad funcionan.

### Contrato de errores en APIv2 (importante)
A diferencia de APIv3, los errores 401 de APIv2 son **texto plano**, no objetos JSON:
- Sin token → cuerpo `401 UNAUTHORIZED`
- Token inválido/expirado → cuerpo `No autorizado.`

## Estructura del proyecto

```
src/
├─ api-test/
│  ├─ apiTipos/features/        # E05: getTiposDocumentos, getTiposVisaciones
│  ├─ apiEntidades/features/    # E02: getEntidadesToken, getEntidades
│  ├─ apiUsuarios/features/     # E03: getUsuarios
│  ├─ genericSteps/             # steps reutilizables (petición + validación)
│  └─ schemas/                  # estructuras de respuesta esperadas
└─ common/
   ├─ hooks/hooks.ts            # reset de contexto + carga de .env
   ├─ support/                  # apiClient, apiContext, logger
   └─ utils/                    # validación de estructura y reportes
```

## Cobertura y fases

- **Fase actual (lecturas)**: E05 Tipos, E02 Entidades, E03 Usuarios (con filtros/paginación).
- **Siguiente**: GET de E01 Documentos (`/documentos/{id}`, `/estado`,
  `/archivo/descargar`, `/recibidos`, `/creados`, `/creados/enviados`, `/buscar`).
- **Posterior**: mutaciones de E01 (`PUT`/`POST`), cuando existan datos de prueba o
  una estrategia de preparación acordada.

Los endpoints marcados como `[ENDPOINT DEPRECADO]` (p. ej. `GET /layouts/`) quedan fuera de alcance.
