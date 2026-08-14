/**
 * Estructuras de respuesta esperadas para la APIv2 (DocDigital).
 *
 * Estas estructuras fueron CONFIRMADAS contra respuestas 200 reales del ambiente
 * demodoc (entidad de prueba). La APIv2 usa snake_case (p. ej. entidad_id,
 * usuario_nombre, documento_principal), a diferencia de APIv3.
 *
 * Envoltura estándar: { status, message, count, timestamp, result } y, en los
 * listados, además { total_count, total_pages, page }.
 *
 * Los errores 401 son texto plano (no JSON): "401 UNAUTHORIZED" (sin token) o
 * "No autorizado." (token inválido/expirado); se validan con steps de texto.
 */

const baseResponse = {
  status: "number",
  message: "string",
  count: "number",
  timestamp: "string",
};

const paginacionOpcional = {
  "total_count?": "number",
  "total_pages?": "number",
  "page?": "number",
};

// E05 - Tipos: result: [{ nombre, tipo_id }]
const baseTipo = {
  nombre: "string",
  tipo_id: "number",
};

// E02 - Entidades: result item
const baseEntidad = {
  entidad_id: "number",
  entidad_nombre: "string",
  "entidad_padre_id?": "number",
  "organismo?": {
    organismo_id: "number",
    organismo_nombre: "string",
  },
};

// E03 - Usuarios: result item (campos no siempre presentes van como opcionales)
const baseUsuario = {
  usuario_id: "number",
  usuario_nombre: "string",
  entidad_id: "number",
  "usuario_run?": "string",
  "usuario_email?": "string",
  "usuario_cargo?": "string",
  "entidad_nombre?": "string",
  "organismo_id?": "number",
  "organismo_nombre?": "string",
};

// E01 - Documentos: item de listado (recibidos/creados/enviados/buscar)
const baseDocumentoItem = {
  solicitud_id: "number",
  documento_principal: {
    documento_id: "number",
  },
};

// E01 - Documento por id
const baseDocumento = {
  solicitud_id: "number",
  documento_principal: {
    documento_id: "number",
    materia: "string",
    nombre_archivo: "string",
  },
};

// E01 - Estado/historial de un documento
const baseDocumentoEstado = {
  documento_id: "number",
  documento_estado: "string",
  documento_estado_fecha: "string",
  documento_historial: [
    {
      fecha: "string",
      evento: "string",
    },
  ],
};

export const successStructures = {
  // E05 - Tipos
  JSON_RESPONSE_TIPO_DOCUMENTO: { ...baseResponse, result: [baseTipo] },
  JSON_RESPONSE_TIPO_VISACION: { ...baseResponse, result: [baseTipo] },

  // E02 - Entidades (result es array, también en /entidades/token)
  JSON_RESPONSE_ENTIDAD_TOKEN: { ...baseResponse, result: [baseEntidad] },
  JSON_RESPONSE_ENTIDADES: { ...baseResponse, ...paginacionOpcional, result: [baseEntidad] },

  // E03 - Usuarios
  JSON_RESPONSE_USUARIOS: { ...baseResponse, ...paginacionOpcional, result: [baseUsuario] },

  // E01 - Documentos
  JSON_RESPONSE_DOCUMENTOS_LISTA: { ...baseResponse, ...paginacionOpcional, result: [baseDocumentoItem] },
  JSON_RESPONSE_DOCUMENTO: { ...baseResponse, result: baseDocumento },
  JSON_RESPONSE_DOCUMENTO_ESTADO: { ...baseResponse, result: baseDocumentoEstado },
};
