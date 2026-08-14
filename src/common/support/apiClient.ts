import axios, { AxiosRequestConfig } from "axios";
import FormData from "form-data";
import { apiContext } from "./apiContext";
import { logApiResponse } from "./logger";

/**
 * Token de ejemplo YA EXPIRADO, reutilizado para el caso de autenticación "expirado".
 * Sirve para validar que la API responde con el mensaje adecuado ante un JWT vencido.
 */
const EXPIRED_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY3IiOnsiaWQiOjg4Mywibm9tYnJlcyI6IkFQSSBQb2xpY8OtYSBkZSBJbnZlc3RpZ2FjaW9uZXMgZGUgQ2hpbGUiLCJhcGVsbGlkb3MiOiJQREkiLCJlbnRpZGFkSWQiOjY2LCJlbnRpZGFkTm9tYnJlIjoiUG9saWPDrWEgZGUgSW52ZXN0aWdhY2lvbmVzIGRlIENoaWxlIiwiZW50aWRhZFNpZ2xhIjoiUERJIiwiY29udGV4dFR5cGUiOiJDVFhfQVBJIn0sInJvbGVzIjpbIlJPTEVfQVBJIl0sImp0aSI6IjAyYmU1ODY5LTNjMzQtNGIwMC04OTU2LTQ2ZDczZDg5NzE5NSIsImlzcyI6ImRvY3YzLnRlc3QuZGlnaXRhbC5nb2IuY2wiLCJpYXQiOjE3NTkzMzQ5MjUsImV4cCI6MTc1OTMzODUyNX0.GUzbf5kDi9JyxfSQy1J8559GJiPaw8wXxNuREgysUR4";

/**
 * Construye los headers de autorización según el "tipo" de token pedido en el feature.
 * - válido:   usa el token obtenido por OAuth (apiContext.token) o, si no existe,
 *             el ACCESS_TOKEN del entorno (útil para pegar un bearer manual de Swagger).
 * - inválido: envía un bearer con formato correcto pero no reconocido.
 * - expirado: envía un JWT real pero vencido.
 * - nulo:     no envía cabecera Authorization.
 */
export function buildAuthConfig(authType: string): AxiosRequestConfig["headers"] {
  const headers: AxiosRequestConfig["headers"] = {};
  switch (authType.toLowerCase()) {
    case "válido":
      headers["Authorization"] = `Bearer ${apiContext.token ?? process.env.ACCESS_TOKEN ?? ""}`;
      break;
    case "inválido":
      headers["Authorization"] = "Bearer token-invalido-123";
      break;
    case "expirado":
      headers["Authorization"] = `Bearer ${EXPIRED_TOKEN}`;
      break;
    case "nulo":
      break;
    default:
      throw new Error(`Tipo de autenticación no reconocido: ${authType}`);
  }
  return headers;
}

/**
 * Función genérica para enviar peticiones y normalizar el manejo de respuestas y errores.
 */
async function sendRequest(config: AxiosRequestConfig, requestBody: any = null) {
  apiContext.attachData = {
    method: config.method?.toUpperCase(),
    url: config.url,
    requestBody: requestBody,
    statusCode: undefined,
    responseBody: undefined,
    authorizationHeader: (config.headers?.Authorization as string) || "N/A (Omitido)",
  };
  apiContext.requestTimestamp = new Date();

  try {
    const response = await axios(config);
    apiContext.response = response;
    apiContext.attachData.statusCode = response.status;
    apiContext.attachData.responseBody = response.data;
    logApiResponse(apiContext.response);
  } catch (error: any) {
    if (error.response) {
      apiContext.response = error.response;
      apiContext.attachData.statusCode = error.response.status;
      apiContext.attachData.responseBody = error.response.data;
      logApiResponse(apiContext.response, true);
    } else {
      console.error("Error de Red:", error.message);
      apiContext.response = { status: 503, data: { error: "Network Error", message: error.message } };
      apiContext.attachData.statusCode = 503;
      apiContext.attachData.responseBody = apiContext.response.data;
      logApiResponse(apiContext.response, true);
    }
  }
}

/**
 * Realiza una petición de autenticación (OAuth client_credentials vía Basic Auth).
 * No guarda el token en el contexto automáticamente, permitiendo probar fallos de auth.
 */
export async function sendAuthRequest(clientId: string, clientSecret: string) {
  const config: AxiosRequestConfig = {
    method: "POST",
    url: `${process.env.API_BASEURL}/oauth/token`,
    auth: { username: clientId, password: clientSecret },
    data: null,
    validateStatus: () => true,
  };

  const reportableBody = { auth: `Basic ${clientId}` };
  await sendRequest(config, reportableBody);
}

/**
 * Realiza una petición GET al endpoint indicado con el tipo de token indicado.
 */
export async function sendGetRequest(endpoint: string, authType: string) {
  const config: AxiosRequestConfig = {
    method: "GET",
    url: `${process.env.API_BASEURL}${endpoint}`,
    headers: { ...buildAuthConfig(authType), Accept: "application/json" },
    validateStatus: () => true,
  };
  await sendRequest(config, null);
}

/**
 * Envía una petición PUT con cuerpo JSON.
 */
export async function sendPutRequest(endpoint: string, authType: string, jsonData: any = null) {
  const config: AxiosRequestConfig = {
    method: "PUT",
    url: `${process.env.API_BASEURL}${endpoint}`,
    headers: { ...buildAuthConfig(authType), "Content-Type": "application/json", Accept: "application/json" },
    data: jsonData,
    validateStatus: () => true,
  };
  await sendRequest(config, jsonData);
}

/**
 * Envía una petición POST con cuerpo JSON.
 */
export async function sendPostRequestWithJson(endpoint: string, authType: string, jsonData: any = null) {
  const config: AxiosRequestConfig = {
    method: "POST",
    url: `${process.env.API_BASEURL}${endpoint}`,
    headers: { ...buildAuthConfig(authType), "Content-Type": "application/json", Accept: "application/json" },
    data: jsonData,
    validateStatus: () => true,
  };
  await sendRequest(config, jsonData);
}

/**
 * Envía una petición POST multipart/form-data (p. ej. documento firmado + metadatos).
 * El PDF no se adjunta al reporte (solo el nombre del archivo y los campos).
 */
export async function sendPostMultipartRequest(endpoint: string, authType: string, formData: FormData, reportableBody: any = null) {
  const headers = { ...buildAuthConfig(authType), ...formData.getHeaders(), Accept: "application/json" };
  const config: AxiosRequestConfig = {
    method: "POST",
    url: `${process.env.API_BASEURL}${endpoint}`,
    headers,
    data: formData,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
  };
  await sendRequest(config, reportableBody);
}

/**
 * Descarga binaria (p. ej. GET /documentos/{id}/archivo/descargar).
 * Usa Accept comodín (el endpoint responde 406 si se pide application/json) y
 * responseType arraybuffer para recibir el archivo. En caso de error 401,
 * el cuerpo (texto plano) se decodifica para poder validarlo con los steps de texto.
 */
export async function sendDownloadRequest(endpoint: string, authType: string) {
  const config: AxiosRequestConfig = {
    method: "GET",
    url: `${process.env.API_BASEURL}${endpoint}`,
    headers: { ...buildAuthConfig(authType), Accept: "*/*" },
    responseType: "arraybuffer",
    validateStatus: () => true,
  };
  await sendRequest(config, null);

  // Normaliza el cuerpo binario: guarda el tamaño y decodifica texto para errores.
  const data = apiContext.response?.data;
  if (data && (Buffer.isBuffer(data) || data instanceof ArrayBuffer || ArrayBuffer.isView(data))) {
    const buf = Buffer.from(data as any);
    apiContext.responseByteLength = buf.length;
    apiContext.responseContentType = apiContext.response.headers?.["content-type"];
    const ct = String(apiContext.responseContentType || "");
    // Si no es binario (p. ej. text/plain o json de error), expón el cuerpo como texto.
    if (ct.includes("text") || ct.includes("json") || ct === "") {
      apiContext.response.data = buf.toString("utf8");
      apiContext.attachData.responseBody = apiContext.response.data;
    } else {
      apiContext.response.data = buf;
      apiContext.attachData.responseBody = `<binario ${buf.length} bytes, ${ct}>`;
    }
  }
}
