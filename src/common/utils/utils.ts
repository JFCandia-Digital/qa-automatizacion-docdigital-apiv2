import assert from "assert";
import { apiContext } from "../support/apiContext";
import { buildAuthConfig } from "../support/apiClient";

/**
 * Decide si un identificador del feature es el NOMBRE de una variable de entorno
 * (p. ej. "CLIENT_ID_PDI") o un valor literal. Si coincide con una variable de
 * entorno definida, devuelve su valor; en caso contrario devuelve el literal.
 */
export function getCredential(credential: string): string {
  const upper = credential.toUpperCase();
  if (Object.prototype.hasOwnProperty.call(process.env, upper) && process.env[upper] !== undefined) {
    return process.env[upper] as string;
  }
  return credential;
}

/**
 * Reemplaza marcadores {VAR} en un endpoint por el valor de la variable de entorno VAR.
 * Ej.: "/documentos/{DOC_ID_PRUEBA}/estado" -> "/documentos/123/estado" si DOC_ID_PRUEBA=123.
 * Si la variable no está definida, deja el marcador tal cual (útil para casos negativos,
 * donde la autenticación falla antes de procesar el id).
 */
export function resolveEndpoint(endpoint: string): string {
  return endpoint.replace(/\{([A-Z0-9_]+)\}/g, (match, varName) => {
    const value = process.env[varName];
    return value !== undefined && value !== "" ? value : match;
  });
}

/**
 * Obtiene un valor anidado por ruta con notación de puntos (p. ej. "result.0.id").
 * Reemplazo mínimo de lodash.get para no añadir dependencias.
 */
export function getByPath(obj: any, path: string): any {
  if (obj === null || obj === undefined) return undefined;
  if (path === "") return obj;
  const parts = path.split(".");
  let current: any = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Indica si existe un valor anidado en la ruta dada.
 */
export function hasByPath(obj: any, path: string): boolean {
  return getByPath(obj, path) !== undefined;
}

/**
 * Valida recursivamente la ESTRUCTURA y los TIPOS de una respuesta contra un modelo.
 * - Un string en el modelo (p. ej. "number") valida el typeof del valor real.
 * - Un array en el modelo valida que el real sea array y aplica el modelo[0] a cada item.
 * - Un objeto valida propiedad a propiedad. Una clave terminada en "?" es opcional.
 *
 * @param actual   El objeto/array real de la respuesta de la API.
 * @param expected El objeto/array con la estructura y tipos esperados.
 * @param path     Ruta actual, para mensajes de error claros.
 */
export function validateStructure(actual: any, expected: any, path: string) {
  if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual), `La propiedad '${path}' debería ser un array.`);
    if (actual.length === 0) return;
    const expectedNode = expected[0];
    for (let i = 0; i < actual.length; i++) {
      validateStructure(actual[i], expectedNode, `${path}[${i}]`);
    }
    return;
  }

  if (typeof expected === "object" && expected !== null) {
    assert.ok(
      typeof actual === "object" && actual !== null,
      `La propiedad '${path}' debería ser un objeto.`
    );
    for (const key in expected) {
      let isOptional = false;
      let actualKey = key;

      if (key.endsWith("?")) {
        isOptional = true;
        actualKey = key.slice(0, -1);
      }

      const currentPath = path ? `${path}.${actualKey}` : actualKey;

      if (isOptional && !Object.prototype.hasOwnProperty.call(actual, actualKey)) {
        continue;
      }

      assert.ok(
        Object.prototype.hasOwnProperty.call(actual, actualKey),
        `Al objeto en la ruta '${path}' le falta la propiedad '${actualKey}'.`
      );

      validateStructure(actual[actualKey], expected[key], currentPath);
    }
    return;
  }

  if (typeof expected === "string") {
    const actualType = typeof actual;
    assert.strictEqual(
      actualType,
      expected,
      `El tipo de '${path}' debería ser '${expected}', pero es '${actualType}'.`
    );
  }
}

/**
 * Adjunta un objeto JSON formateado al reporte de Cucumber.
 */
export function attachJsonToReport(worldContext: any, data: any, fileName: string) {
  try {
    worldContext.attach(JSON.stringify(data, null, 2), {
      mediaType: "application/json",
      fileName: fileName,
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    worldContext.attach(`Error al adjuntar ${fileName}: ${errorMessage}`, {
      mediaType: "text/plain",
      fileName: `${fileName}_Error.txt`,
    });
  }
}

/**
 * Adjunta una parte específica del reporte (request, status, response o token).
 */
export function attachReport(
  worldContext: any,
  part: "request" | "status" | "response" | "token",
  typeToken?: string
) {
  try {
    switch (part) {
      case "request": {
        const { method, url, requestBody } = apiContext.attachData;
        worldContext.attach(`Request: ${method || "N/A"} ${url || "N/A"}`, {
          mediaType: "text/plain",
          fileName: "RequestInfo.txt",
        });
        if (requestBody) {
          attachJsonToReport(worldContext, requestBody, "RequestBody.json");
        }
        break;
      }
      case "status": {
        const { statusCode } = apiContext.attachData;
        worldContext.attach(`Status: ${statusCode || "N/A"}`, {
          mediaType: "text/plain",
          fileName: "StatusInfo.txt",
        });
        break;
      }
      case "response": {
        const { responseBody } = apiContext.attachData;
        attachJsonToReport(worldContext, responseBody ?? {}, "ResponseBody.json");
        break;
      }
      case "token": {
        let authValue = "N/A";
        if (typeToken) {
          const headers = buildAuthConfig(typeToken);
          authValue = (headers?.Authorization as string) || "N/A (Omitido)";
        } else {
          authValue = apiContext.attachData.authorizationHeader || "N/A";
        }
        worldContext.attach(`Authorization Header: ${authValue || "N/A"}`, {
          mediaType: "text/plain",
          fileName: "AuthorizationHeader.txt",
        });
        break;
      }
    }
  } catch (e) {
    worldContext.attach(
      `Error al adjuntar la parte '${part}' del reporte: ${e instanceof Error ? e.message : String(e)}`,
      { mediaType: "text/plain", fileName: "ReportError.txt" }
    );
  }
}
