# qa-automatizacion-docdigital-apiv2

Automatización QA de **regresión** para la **APIv2 de DocDigital**.

Cucumber + TypeScript + Axios. Cubre los endpoints **vigentes** de la tarjeta
(E05 Tipos, E03 Usuarios, E02 Entidades, E01 Documentos GET + mutaciones PUT/POST).
Quedan fuera los `[ENDPOINT DEPRECADO]` (p. ej. `/layouts/`).

La suite está **alineada a QA** (`docv3.test`). El estilo sigue la suite APIv3.5,
pero el contrato es el de APIv2 (snake_case, 401 en texto plano, paginación
obligatoria en listados de documentos).

> **`npm run apiTest` no despacha nada.** Los happy-path que crean o acusen
> documentos van con tag `@Mutacion` y se corren a mano.

Swagger QA (VPN):
https://middleware.docv3.test.digital.gob.cl/api/swagger-ui/index.html

---

## Stack y requisitos

- Node.js 18+ (probado con 22)
- Cucumber, TypeScript (`ts-node`), Axios
- **QA requiere VPN** (host privado). demodoc es público, sin VPN.

```bash
npm install
cp .env.example .env      # Windows: Copy-Item .env.example .env
```

El `.env` es local (`.gitignore`). **No lo subas.**

---

## Autenticación (sin renovar JWT a mano)

Los tokens duran ~1 h. **No hace falta pegar `ACCESS_TOKEN`.**

Si están `CLIENT_ID_*` / `CLIENT_SECRET_*`, el hook pide el JWT solo:

| Escenarios | Credencial | Token issuer QA |
| --- | --- | --- |
| Lecturas GET y `POST /firmado/ingresar` | `CLIENT_ID_PDI` | `POST /api/v3/oauth/token` |
| `@AcusoRecibo` y `@Devolver` | `CLIENT_ID_ARMADA` | el mismo issuer |

En consola vas a ver `[oauth] token PDI OK (~60 min)` (o `ARMADA`).

`API_BASEURL` es **sin** `/v3`. El OAuth de QA sí va a `/api/v3/oauth/token`.
demodoc usa `{API_BASEURL}/oauth/token`. Override: `OAUTH_TOKEN_URL`.

Dejá `ACCESS_TOKEN=` vacío. Solo sirve como fallback (p. ej. bearer de Swagger)
si no hay client_id.

---

## `.env` (QA)

```env
API_BASEURL=https://middleware.docv3.test.digital.gob.cl/api
ACCESS_TOKEN=

CLIENT_ID_PDI=          # uapi_66_…  origen PDI
CLIENT_SECRET_PDI=
CLIENT_ID_ARMADA=       # uapi_210_… receptor Armada
CLIENT_SECRET_ARMADA=

DESTINATARIO_ENTIDAD_ID=210
DOC_ID_PRUEBA=90104
DOC_RECIBIDO_ID=
TIPO_DOCUMENTO_ID=1
```

| Variable | Uso |
| --- | --- |
| `DESTINATARIO_ENTIDAD_ID` | Destino del `POST /firmado/ingresar` (Armada = **210**) |
| `ID_ENTIDAD_CREADORA` | Origen del POST. Si está vacío, se lee `acr.entidadId` del JWT (PDI = **66**) |
| `DOC_ID_PRUEBA` | `GET /documentos/{id}` (p. ej. el 90104 ingresado en QA) |
| `DOC_RECIBIDO_ID` | Acuse/devolver. Tiene que estar **pendiente de acuse**. Un id ya acusido falla |

Windows: si Cucumber dice que falta `DESTINATARIO_ENTIDAD_ID` con el valor en el archivo,
el `.env` quedó en UTF-16 (Bloc de notas). Guardalo como UTF-8, o en esa sesión:

```powershell
$env:DESTINATARIO_ENTIDAD_ID="210"
```

---

## Ambientes

| Ambiente | `API_BASEURL` | Acceso | OAuth |
| --- | --- | --- | --- |
| **QA (objetivo)** | `https://middleware.docv3.test.digital.gob.cl/api` | VPN | `POST /api/v3/oauth/token` |
| demodoc | `https://api-demodoc.digital.gob.cl/api` | Público | `POST /api/oauth/token` |

Diferencias verificadas (la suite sigue **QA**):

| Tema | QA | demodoc |
| --- | --- | --- |
| Token expirado | `"Sesión expirada."` | `"No autorizado."` |
| Listados `/documentos/creados`, `/creados/enviados`, `/buscar` | Exigen `pageSize` y `pageNumber`; sin ellos **502** | Más permisivo |
| `POST /firmado/ingresar` | **JSON** (multipart → **415**) | — |

---

## Entidades en QA (comprobadas)

`GET /entidades/` con token PDI **no lista** las entidades de laboratorio (ids 1 y 2).
Sí aparecen en `GET /usuarios/` y en destinatarios de documentos.

| `entidad_id` | Nombre | Rol en esta suite |
| --- | --- | --- |
| **1** | Entidad TEST Agosto KE | Laboratorio (Patricia / QA) |
| **2** | Entidad_Test_2019 | Laboratorio |
| **66** | Policía de Investigaciones de Chile | Origen API (`uapi_66_`) |
| **210** | Armada de Chile | Destino API (`uapi_210_`) |

QA clona el catálogo de instituciones reales; el tráfico se queda en `docv3.test`
(igual que la suite v3.5). Aun así **no** uses como `DOC_RECIBIDO_ID` documentos
viejos de Patricia con cientos de CC a organismos reales (p. ej. 83377).

El `client_id` trae el id: `uapi_{entidad_id}_…`.

---

## Ejecución

Para la entrega alcanza **`npm run apiTest`**. El resto es opcional o, las mutaciones, solo a mano.

### Suite completa / cortes rápidos

```bash
npm run smoke        # Solo @Smoke: 401 de GET /tipos/documentos/ (inválido / expirado / nulo). Sin credenciales. ¿QA responde?
npm run negativo     # Todos los @Negativo: 401 de todos los endpoints. Sin CLIENT_ID. No muta datos.
npm run apiTest      # Entrega. @API menos @Mutacion: GET + validaciones 400/404/401. No despacha. (72 escenarios)
```

### Por área

Útiles para acotar. No hace falta mandarlas todas en la entrega.

```bash
npm run tipos              # E05 completo: visaciones + tipos de documento (200 y 401)
npm run tiposDocumentos    # Solo GET /tipos/documentos/
npm run tiposVisaciones    # Solo GET /tipos/visaciones/
npm run entidades          # E02: /entidades/ y /entidades/token (200, paginación, 400, 401)
npm run usuarios           # E03: /usuarios/ (200, paginación, filtros inválidos, 401)
npm run documentos         # E01 GET + validaciones de PUT/POST, sin happy-path. No ingresa, no acusa, no devuelve.
```

### Mutaciones (cambian QA — solo a mano)

Cada `@Mutacion` **cambia datos en QA**. No las pongas en el default.

```bash
npm run mutaciones   # Las cuatro juntas: ingresar + acuse + devolver + atributos. La más agresiva.
```

Mejor de a una:

```bash
npx cucumber-js --tags "@FirmadoIngresar and @Mutacion"       # Despacha un documento (PDI → Armada)
npx cucumber-js --tags "@AcusoRecibo and @Mutacion"           # Acusa DOC_RECIBIDO_ID (tiene que estar pendiente)
npx cucumber-js --tags "@Devolver and @Mutacion"              # Devuelve ese recibido pendiente
npx cucumber-js --tags "@AtributosAdicionales and @Mutacion"  # PUT atributos del DOC_ID_PRUEBA (puede 403 sin permiso)
```

### Reportes

```bash
npm run apiTest       # Deja el JSON en reports/json/ (además del HTML nativo)
npm run report        # Dashboard en reports/html/index.html
npm run report:open   # Lo mismo y lo abre en el navegador
```

También: `reports/report.html` (HTML simple de Cucumber). La carpeta `reports/` no se versiona.

---

## Mutaciones (happy-path)

Cada `@Mutacion` **cambia datos en QA**. No lo pongas en el default.

### Circuito verificado (14-08-2026)

1. **PDI** `POST /documentos/firmado/ingresar` → Armada **210**
   - Documento **90104**, folio `QA-JFC-…`, materia con **JFC**
   - Mail DocDigital: `no-reply@digital.gob.cl`
2. **Armada** `PUT /documentos/recibidos/90104/acusorecibo` → `200` `{ completada: true }`

El 90104 **ya tiene acuse**. No lo uses de nuevo en `DOC_RECIBIDO_ID`.
Para otro acuse/devolver: ingresá un documento nuevo y acusá **ese** id.

Nombre / materia / folio del ingresar llevan **JFC** para filtrar el mail.

### Contrato `POST /documentos/firmado/ingresar`

- `Content-Type: application/json` (multipart → 415)
- PDF en **base64** en `documento` (`src/data/files/Firmado_por_ecert.pdf`)
- Obligatorios (Swagger QA):

```json
{
  "nombre": "Documento QA JFC …",
  "tipo_id": 1,
  "id_entidad_creadora": 66,
  "listado_id_entidades_destinatarias": [210],
  "folio": "QA-JFC-<timestamp>",
  "materia": "JFC Prueba de automatizacion QA (PDI -> Armada)",
  "documento": "<base64>"
}
```

`entidad_id` **no** vale: responde `400 "El id de la entidad es obligatorio"`.

Respuesta 200:

```json
{ "result": { "fecha_ingreso": "…", "id_documento": 90104, "id_solicitud": 90104, "anexos": [] } }
```

### Acuse / devolver

Usan token **Armada** (hook). El id tiene que existir como recibido **pendiente**.
`GET /documentos/{id}` con token Armada basta (el listado `/recibidos` pagina 275
páginas y los nuevos no siempre están en la última).

Acuse y devolver se pisan: un id acusido ya no está pendiente.

### Atributos adicionales

`PUT /documentos/{id}/atributos-adicionales` — body **mapa** `{ "clave": "valor" }`, no array.
Puede responder **403** si el API no tiene permiso de escritura sobre ese documento.

---

## Tags

| Tag | Qué |
| --- | --- |
| `@API` | Toda la suite API |
| `@Negativo` | Auth 401; corre **sin** credenciales |
| `@RequiereCredenciales` | 200 / 400 con token válido (OAuth automático) |
| `@RequiereDatos` | Además `DOC_ID_PRUEBA` o `DOC_RECIBIDO_ID` |
| `@Mutacion` | Despacha o muta. Fuera de `apiTest` |
| `@Smoke` | Conectividad rápida |
| Área | `@Tipos` `@Entidades` `@Usuarios` `@Documentos` + subtag de endpoint (`@FirmadoIngresar`, `@AcusoRecibo`, …) |

---

## Qué valida cada test

Común a todos:
- **Positiva** (token válido): `200`, `result`, estructura/tipos (snake_case).
- **Negativa**: sin token → `401 "401 UNAUTHORIZED"`; inválido → `401 "No autorizado."`;
  expirado (QA) → `401 "Sesión expirada."`.

### E05 — Tipos
- `GET /tipos/documentos/` — `@Smoke`. `result: [{ nombre, tipo_id }]`.
- `GET /tipos/visaciones/` — igual patrón.

### E02 — Entidades
- `GET /entidades/token` — entidades del token (`result` **array**). PDI → id 66.
- `GET /entidades/` — listado + paginación. `pageSize`/`pageNumber` inválidos → 400.
  Filtro `nombre` **no filtra** (texto se ignora, 200).

### E03 — Usuarios
- `GET /usuarios/` — filtros/paginación. `run=abc` y paginación inválida → 400.

### E01 — GET Documentos
- `GET /documentos/recibidos` | `/creados` | `/creados/enviados` | `/buscar`
  — lista `[{ solicitud_id, documento_principal.documento_id }]`. En QA **con** `pageSize` y `pageNumber`.
- `GET /documentos/{id}` — `DOC_ID_PRUEBA` → objeto.
- `GET /documentos/{id}/estado` — estado + historial.
- `GET /documentos/{id}/archivo/descargar` — binario (`Accept: */*`). Con `application/json` → **406**.

### E01 — Mutaciones
Auth 401 + validación 400/404 **siempre** (no mutan). Happy-path solo `@Mutacion`:
- `PUT /{id}/atributos-adicionales` — 404 si no existe.
- `PUT /recibidos/{id}/devolver` — 400 sin motivo.
- `PUT /recibidos/{id}/acusorecibo` — 400 si no está pendiente.
- `POST /firmado/ingresar` — 400 cuerpo vacío (`El nombre del documento es obligatorio`).

---

## Contrato de errores APIv2

Los **401 son texto plano**, no JSON.

Respuestas OK: `{ status, message, count, timestamp, result }` y a veces
`total_count`, `total_pages`, `page`. Campos en snake_case.

---

## Hallazgos (para reportar / no re-descubrir)

- **`GET /entidades/?nombre=…` no filtra.** `nombre=Test 2019` devuelve la página 1 de
  instituciones reales. Buscar Test 2019 / KE en `/usuarios/` o en el documento
  (`entidad_id` 1 y 2).
- **`POST /firmado/ingresar` no es multipart.** Axios + `form-data` termina en 415
  (`charset=UTF-8` / media type no registrado). Cuerpo JSON + PDF base64.
- **`/documentos/buscar` y `POST /firmado/ingresar`**: bearer no-JWT (`Bearer x`)
  a veces **no** da 401 y pasa a validar negocio (posible bug).
- **`/archivo/descargar`**: 406 si `Accept: application/json`.
- Validación 400 **determinista** solo en numéricos (`pageSize`, `pageNumber`, `run`).
  Filtros de texto inválidos → 200.
- Listado `/recibidos` de Armada: ~2700 ítems; un doc recién ingresado se ve
  con `GET /documentos/{id}` aunque no aparezca en la última página.

---

## Estructura

```
src/
├─ api-test/
│  ├─ apiTipos/features/
│  ├─ apiEntidades/features/
│  ├─ apiUsuarios/features/
│  ├─ apiDocumentos/features/     # GET + PUT/POST
│  ├─ apiDocumentos/steps/        # firmadoIngresar (JSON + PDF)
│  ├─ genericSteps/
│  └─ schemas/
├─ data/files/                    # PDFs (Firmado_por_ecert.pdf, …)
└─ common/
   ├─ hooks/hooks.ts              # .env (UTF-8/UTF-16) + OAuth por escenario
   ├─ support/apiClient.ts
   ├─ support/oauth.ts            # cache JWT PDI/Armada
   └─ utils/
```

---

## Cobertura

| Fase | Estado en QA |
| --- | --- |
| Lecturas GET (E05, E02, E03, E01) | **72/72** (`apiTest`, 330 pasos) |
| Mutaciones: validaciones 401/400 | Incluidas en `apiTest` (no mutan) |
| `POST /firmado/ingresar` happy-path | **200** doc 90104 (PDI→Armada, mail JFC) |
| `PUT …/acusorecibo` happy-path | **200** `completada: true` (token Armada) |
| `PUT …/devolver` happy-path | Implementado; hace falta un recibido **pendiente** |
| `PUT …/atributos-adicionales` happy-path | Implementado; puede 403 sin permiso de escritura |
