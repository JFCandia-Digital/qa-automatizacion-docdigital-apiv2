/**
 * Estructuras de respuesta esperadas para la APIv2 (DocDigital).
 *
 * NOTA IMPORTANTE (APIv2 vs APIv3):
 * - Las estructuras de ÉXITO están inferidas del contrato del Swagger de APIv2 y del
 *   estilo de APIv3. Como su validación en verde requiere un token válido (aún pendiente
 *   de credenciales demodoc), deben CONFIRMARSE/ajustarse contra una respuesta 200 real.
 *   Por eso los escenarios positivos están etiquetados con @RequiereCredenciales.
 * - Los errores 401 de APIv2 NO son objetos JSON (como en v3) sino texto plano:
 *     · sin token   -> body "401 UNAUTHORIZED" (text/plain)
 *     · token malo  -> body "No autorizado."   (application/json, string)
 *   Por eso los errores se validan con steps de texto y no con estas estructuras.
 */

// Envoltura estándar DocDigital (a confirmar contra respuesta real de v2).
const baseResponse = {
  status: "number",
  message: "string",
  count: "number",
  timestamp: "string",
};

const baseResponsePaginado = {
  ...baseResponse,
  total_count: "number",
  total_pages: "number",
  page: "number",
};

const baseTipoDocumento = {
  grupo: "string",
  tiposDocumentoOficial: [
    {
      id: "number",
      descripcion: "string",
    },
  ],
};

const baseTipoVisacion = {
  id: "number",
  descripcion: "string",
};

const baseEntidad = {
  entidadId: "number",
  entidadNombre: "string",
  isPrincipal: "boolean",
  sigla: "string",
  isActiva: "boolean",
};

const baseUsuario = {
  usuarioId: "number",
  entidadId: "number",
  entidadNombre: "string",
  usuarioRun: "string",
  nombreCompleto: "string",
  correoInstitucional: "string",
  usuarioCargo: "string",
};

export const successStructures = {
  JSON_RESPONSE_RESULT_SIN_DATOS: {
    ...baseResponsePaginado,
    result: [],
  },

  JSON_RESPONSE_TIPO_DOCUMENTO: {
    ...baseResponse,
    result: [baseTipoDocumento],
  },

  JSON_RESPONSE_TIPO_VISACION: {
    ...baseResponse,
    result: [baseTipoVisacion],
  },

  JSON_RESPONSE_ENTIDAD_TOKEN: {
    ...baseResponse,
    result: baseEntidad,
  },

  JSON_RESPONSE_ENTIDADES: {
    ...baseResponsePaginado,
    result: [baseEntidad],
  },

  JSON_RESPONSE_USUARIOS: {
    ...baseResponsePaginado,
    result: [baseUsuario],
  },
};
