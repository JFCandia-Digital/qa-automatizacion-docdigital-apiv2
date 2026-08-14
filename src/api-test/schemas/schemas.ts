/**
 * Estructuras de respuesta esperadas para la APIv2 (DocDigital).
 *
 * NOTA IMPORTANTE (APIv2 vs APIv3):
 * - La envoltura estándar confirmada contra el ambiente es:
 *     { status:number, message:string, count:number, timestamp:string, result: ... }
 *   (revelada por GET /documentos/buscar). Los campos de paginación
 *   (total_count/total_pages/page) se declaran OPCIONALES porque no todos los
 *   endpoints los devuelven.
 * - Las estructuras de "result" de los escenarios positivos están inferidas del
 *   Swagger y deben CONFIRMARSE contra una respuesta 200 real (por eso esos
 *   escenarios están etiquetados @RequiereCredenciales).
 * - Los errores 401 de APIv2 NO son objetos JSON sino texto plano:
 *     · sin token   -> "401 UNAUTHORIZED"
 *     · token malo  -> "No autorizado."
 *   Por eso los errores se validan con steps de texto, no con estas estructuras.
 */

// Envoltura estándar DocDigital (confirmada).
const baseResponse = {
  status: "number",
  message: "string",
  count: "number",
  timestamp: "string",
};

// Campos de paginación, opcionales (no todos los endpoints los incluyen).
const paginacionOpcional = {
  "total_count?": "number",
  "total_pages?": "number",
  "page?": "number",
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
};

const baseUsuario = {
  usuarioId: "number",
  entidadId: "number",
  entidadNombre: "string",
};

export const successStructures = {
  // Envoltura con result vacío (útil para respuestas sin datos, p. ej. buscar sin coincidencias).
  JSON_RESPONSE_RESULT_SIN_DATOS: {
    ...baseResponse,
    ...paginacionOpcional,
    result: [],
  },

  // E05 - Tipos
  JSON_RESPONSE_TIPO_DOCUMENTO: {
    ...baseResponse,
    result: [baseTipoDocumento],
  },
  JSON_RESPONSE_TIPO_VISACION: {
    ...baseResponse,
    result: [baseTipoVisacion],
  },

  // E02 - Entidades
  JSON_RESPONSE_ENTIDAD_TOKEN: {
    ...baseResponse,
    result: baseEntidad,
  },
  JSON_RESPONSE_ENTIDADES: {
    ...baseResponse,
    ...paginacionOpcional,
    result: [baseEntidad],
  },

  // E03 - Usuarios
  JSON_RESPONSE_USUARIOS: {
    ...baseResponse,
    ...paginacionOpcional,
    result: [baseUsuario],
  },

  // E01 - Documentos
  // Listados (recibidos/creados/creados-enviados/buscar): envoltura + result como array.
  JSON_RESPONSE_DOCUMENTOS_LISTA: {
    ...baseResponse,
    ...paginacionOpcional,
    result: [],
  },
  // Documento por id: envoltura + result como objeto.
  JSON_RESPONSE_DOCUMENTO: {
    ...baseResponse,
    result: "object",
  },
  // Estado/historial de un documento: envoltura + result presente.
  JSON_RESPONSE_DOCUMENTO_ESTADO: {
    ...baseResponse,
    result: "object",
  },
};
