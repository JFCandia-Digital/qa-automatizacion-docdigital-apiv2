# qa-automatizacion-docdigital-apiv2

Automatización QA de **regresión** para la **APIv2 de DocDigital**.

Suite de pruebas de API construida con Cucumber + TypeScript + Axios. Toma como
referencia de estilo/cobertura la suite de APIv3, adaptada al **contrato real de
APIv2** (verificado contra el ambiente demodoc). Cubre todos los endpoints
**vigentes** de la tarjeta (lecturas GET + mutaciones PUT/POST). Los
`[ENDPOINT DEPRECADO]`, como `/layouts/`, quedan fuera.

> Las **mutaciones** (`PUT`/`POST`) que despachan o modifican datos están en
> escenarios `@Mutacion`, **excluidos de las corridas por defecto** para no afectar
> datos ni despachar a nadie. Sus **validaciones de entrada** (auth 401 y cuerpos
> inválidos 400/404) sí se ejecutan siempre y son seguras (no mutan nada).

---

## Stack
- Node.js (probado con Node 22)
- Cucumber (`@cucumber/cucumber`)
- TypeScript (vía `ts-node`)
- Axios

## Requisitos
- Node.js 18+.
- Acceso de red al ambiente (por defecto `https://api-demodoc.digital.gob.cl/api`, público, sin VPN).

---

## Setup

```bash
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

Completa el archivo **`.env`** (es local, está en `.gitignore`, no se sube). Hay dos vías de autenticación:

```env
API_BASEURL=https://api-demodoc.digital.gob.cl/api

# Opción A) Bearer ya emitido (p. ej. de Swagger -> Authorize, o de POST /oauth/token)
ACCESS_TOKEN=

# Opción B) Credenciales OAuth (client_credentials). En demodoc se generan en:
# Mantenedor de entidades -> (entidad de prueba) -> Habilitación API
CLIENT_ID_PDI=
CLIENT_SECRET_PDI=

# ID de un documento existente en la entidad, para los GET de E01 con {id}
DOC_ID_PRUEBA=
```

> Los tokens de esta API duran ~1 hora. Si un escenario positivo devuelve 401,
> probablemente el token expiró: renuévalo en `.env`.

Para obtener un token con las credenciales OAuth:
```bash
curl -u "CLIENT_ID:CLIENT_SECRET" -X POST "https://api-demodoc.digital.gob.cl/api/oauth/token"
# copia el "access_token" del JSON y ponlo en .env como ACCESS_TOKEN
```

---

## Ejecución

```bash
npm run smoke        # health-check rápido (negativos de auth; sin credenciales)
npm run negativo     # todos los casos negativos (401); no requieren token válido
npm run apiTest      # toda la suite SEGURA (@API, excluye @Mutacion) — no despacha nada

# por área
npm run tipos            # E05 Tipos (documentos + visaciones)
npm run tiposDocumentos  # solo GET /tipos/documentos/
npm run tiposVisaciones  # solo GET /tipos/visaciones/
npm run entidades        # E02 Entidades
npm run usuarios         # E03 Usuarios
npm run documentos       # E01 Documentos (excluye @Mutacion)

# SOLO ejecución manual y controlada (despacha/muta datos, KE <-> Test 2019):
npm run mutaciones       # happy-path de PUT/POST de E01 (@Mutacion)
```

> `npm run mutaciones` ejecuta los escenarios que **modifican/despachan** datos.
> Úsalo solo de forma controlada, con `DOC_RECIBIDO_ID` de un documento recibido
> desde otra entidad de prueba y destinatario **Test 2019** (nunca instituciones reales).

Se genera un reporte HTML en `reports/report.html`.

---

## Tags (etiquetas)

- `@API` — todos los escenarios de API.
- `@Negativo` — validaciones de autenticación (token inválido/expirado/nulo → **401**). Corren en verde **sin credenciales**.
- `@RequiereCredenciales` — escenarios positivos (200) y validación de parámetros (400). Requieren token válido en `.env`.
- `@RequiereDatos` — además de token, necesitan un `DOC_ID_PRUEBA`/`DOC_RECIBIDO_ID` (documento existente).
- `@Mutacion` — escenarios que **modifican o despachan** datos (PUT/POST). **Excluidos por defecto**; se corren solo con `npm run mutaciones`.
- `@Smoke` — subconjunto rápido para verificar framework + conectividad.
- Por área: `@Tipos`, `@Entidades`, `@Usuarios`, `@Documentos` (+ subtags por endpoint).

---

## Qué valida cada test

Todos los endpoints comparten dos tipos de comprobación:
- **Positiva** (con token válido): código `200`, presencia de `result` y **validación de estructura/tipos** de la respuesta contra un esquema esperado.
- **Negativa** (autenticación): sin token → `401 "401 UNAUTHORIZED"`; token inválido/expirado → `401 "No autorizado."`.

### E05 — Tipos
- **`GET /tipos/documentos/`** (`getTiposDocumentos.feature`, `@Smoke`)
  - Positivo: `200` + estructura `JSON_RESPONSE_TIPO_DOCUMENTO` (`result: [{ nombre, tipo_id }]`).
  - Negativos: inválido/expirado/nulo → `401`.
- **`GET /tipos/visaciones/`** (`getTiposVisaciones.feature`)
  - Positivo: `200` + estructura `JSON_RESPONSE_TIPO_VISACION` (`result: [{ nombre, tipo_id }]`).
  - Negativos → `401`.

### E02 — Entidades
- **`GET /entidades/token`** (`getEntidadesToken.feature`) — entidades asociadas al token.
  - Positivo: `200` + estructura `JSON_RESPONSE_ENTIDAD_TOKEN` (`result` es **array** de entidades).
  - Negativos → `401`.
- **`GET /entidades/`** (`getEntidades.feature`) — listado con filtros/paginación.
  - Positivo: `200` + estructura `JSON_RESPONSE_ENTIDADES`.
  - Paginación válida (`pageSize`, `pageNumber`) → `200`.
  - Parámetros inválidos (`pageSize=0`, `pageSize=abc`, `pageNumber=abc`) → `400`.
  - Negativos de auth → `401`.
  - Prepara y ejecuta con parámetros pero **sin token** → `401` (valida el flujo preparar→parametrizar→ejecutar).

### E03 — Usuarios
- **`GET /usuarios/`** (`getUsuarios.feature`) — usuarios/destinatarios con filtros/paginación.
  - Positivo: `200` + estructura `JSON_RESPONSE_USUARIOS`.
  - Paginación válida → `200`.
  - Parámetros inválidos (`run=abc`, `pageSize=0`, `pageSize=abc`, `pageNumber=abc`) → `400`.
  - Negativos de auth → `401`.
  - Prepara y ejecuta con parámetros sin token → `401`.

### E01 — Documentos (solo GET en esta fase)
- **`GET /documentos/recibidos`** (`getDocumentosRecibidos.feature`) — recibidos por la entidad.
  - Positivo: `200` + `JSON_RESPONSE_DOCUMENTOS_LISTA` (`result: [{ solicitud_id, documento_principal: { documento_id } }]`).
  - Negativos → `401`.
- **`GET /documentos/creados`** (`getDocumentosCreados.feature`) — creados por la entidad. Igual patrón.
- **`GET /documentos/creados/enviados`** (`getDocumentosCreadosEnviados.feature`) — foliados/enviados. Igual patrón.
- **`GET /documentos/buscar`** (`getDocumentosBuscar.feature`) — búsqueda.
  - Positivo: `200` + `JSON_RESPONSE_DOCUMENTOS_LISTA`.
  - Paginación válida → `200`.
  - Negativos: expirado/nulo → `401`. (El caso "token inválido" se omite por una anomalía documentada, ver abajo.)
- **`GET /documentos/{id}`** (`getDocumentoPorId.feature`, `@RequiereDatos`) — documento por ID.
  - Positivo: usa `DOC_ID_PRUEBA` → `200` + `JSON_RESPONSE_DOCUMENTO` (`result` objeto).
  - Negativos: usan un id fijo (`1`) → `401`.
- **`GET /documentos/{id}/estado`** (`getDocumentoEstado.feature`, `@RequiereDatos`) — estado e historial.
  - Positivo: `200` + `JSON_RESPONSE_DOCUMENTO_ESTADO` (`result: { documento_id, documento_estado, documento_estado_fecha, documento_historial: [...] }`).
  - Negativos → `401`.
- **`GET /documentos/{id}/archivo/descargar`** (`getDocumentoArchivoDescargar.feature`, `@RequiereDatos`) — descarga del archivo (binario).
  - Positivo: `200` + **archivo descargable** (valida tamaño > 0 y Content-Type no-JSON, p. ej. `application/pdf`). Se solicita con `Accept` comodín.
  - Negativos → `401`.

### E01 — Documentos (mutaciones PUT/POST)
Cada mutación valida **auth** (401) y **entrada** (400/404) de forma segura (no muta),
y deja el **happy-path `@Mutacion`** implementado pero excluido por defecto.
- **`PUT /documentos/{id}/atributos-adicionales`** (`putAtributosAdicionales.feature`)
  - Negativos → `401`. Validación: documento inexistente → `404 "Documento no encontrado"`.
  - `@Mutacion`: actualizar atributos de un documento propio → `200` (requiere `DOC_ID_PRUEBA`).
- **`PUT /documentos/recibidos/{id}/devolver`** (`putDevolver.feature`)
  - Negativos → `401`. Validación: sin motivo → `400 "Motivo de rechazo..."`.
  - `@Mutacion`: devolver un recibido desde Test 2019 → `200` (requiere `DOC_RECIBIDO_ID`).
- **`PUT /documentos/recibidos/{id}/acusorecibo`** (`putAcusoRecibo.feature`)
  - Negativos → `401`. Validación: sin doc en estado pendiente → `400 "...estado pendiente"`.
  - `@Mutacion`: dar acuso a un recibido de prueba → `200` (requiere `DOC_RECIBIDO_ID`).
- **`POST /documentos/firmado/ingresar`** (`postFirmadoIngresar.feature`)
  - Negativo: sin token → `401`. Validación: cuerpo vacío → `400` (lista de campos obligatorios).
  - `@Mutacion`: ingresar/despachar un firmado **a Test 2019** → `200` (requiere PDF firmado; **despacha**).

---

## Contrato de errores en APIv2 (importante)

A diferencia de APIv3, los errores `401` son **texto plano** (no objetos JSON):
- Sin token → `401 UNAUTHORIZED`
- Token inválido/expirado → `No autorizado.`

Las respuestas exitosas usan **snake_case** (`entidad_id`, `usuario_nombre`, `documento_principal`, …).

## Hallazgos verificados (para reportar)

- **`/documentos/{id}/archivo/descargar`** responde `406` si se pide `Accept: application/json`; hay que pedirlo con `Accept` comodín (por eso tiene cliente/steps de descarga propios).
- **`/documentos/buscar` — posible bug de seguridad**: con un token de formato no-JWT (p. ej. `Bearer x`) responde `200` (valida solo la presencia del header), mientras que sin token responde `401` y con JWT expirado `401`.
- **Validación de parámetros**: solo paginación y campos numéricos (`pageSize`, `pageNumber`, `run`) devuelven `400`; los filtros de texto no numéricos se ignoran (`200`).

---

## Estructura del proyecto

```
src/
├─ api-test/
│  ├─ apiTipos/features/        # E05: getTiposDocumentos, getTiposVisaciones
│  ├─ apiEntidades/features/    # E02: getEntidadesToken, getEntidades
│  ├─ apiUsuarios/features/     # E03: getUsuarios
│  ├─ apiDocumentos/features/   # E01 (GET): recibidos, creados, creados/enviados,
│  │                            #            buscar, por id, estado, descargar
│  ├─ genericSteps/             # steps reutilizables (petición + validación)
│  └─ schemas/                  # estructuras de respuesta esperadas (snake_case)
└─ common/
   ├─ hooks/hooks.ts            # reset de contexto + carga de .env
   ├─ support/                  # apiClient (auth, GET, OAuth, descarga), apiContext, logger
   └─ utils/                    # validación de estructura, resolveEndpoint, reportes
```

## Cobertura y fases

Cubre **todos los endpoints vigentes** de la tarjeta (E05, E03, E02, E01):

- **Lecturas (GET)**: E05 Tipos, E02 Entidades, E03 Usuarios y E01 GET Documentos — validadas en verde.
- **Mutaciones (PUT/POST de E01)**: auth + validaciones de entrada validadas en verde (seguras); el
  **happy-path** (`@Mutacion`) queda implementado pero **excluido por defecto**, para ejecutarse
  de forma controlada **entre entidades de prueba** (KE ↔ Test 2019), nunca hacia instituciones
  reales, una vez definidos los datos (documento recibido de prueba y PDF firmado).
