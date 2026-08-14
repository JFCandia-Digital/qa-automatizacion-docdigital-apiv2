import { Given, When, DataTable } from "@cucumber/cucumber";
import { sendGetRequest, sendAuthRequest, sendDownloadRequest } from "../../common/support/apiClient";
import { apiContext } from "../../common/support/apiContext";
import { attachReport, attachJsonToReport, getCredential, resolveEndpoint } from "../../common/utils/utils";

/**
 * Solicita un token de acceso (OAuth client_credentials) y lo guarda en el contexto
 * si la autenticación fue exitosa. Acepta nombres de variables de entorno
 * (p. ej. "CLIENT_ID_PDI") o valores literales.
 */
Given(
  "que solicito un token de acceso con el cliente {string} y el secret {string}",
  async function (this: any, clientIdKey: string, clientSecretKey: string) {
    const clientId = getCredential(clientIdKey);
    const clientSecret = getCredential(clientSecretKey);

    await sendAuthRequest(clientId, clientSecret);

    if (apiContext.response.status === 200 && apiContext.response.data?.access_token) {
      apiContext.token = apiContext.response.data.access_token;
    } else {
      apiContext.token = null;
      console.warn(
        `No se pudo obtener el token para ${clientIdKey}. Status: ${apiContext.response.status}`
      );
    }
    attachReport(this, "request");
  }
);

/**
 * Realiza directamente una petición GET al endpoint indicado con el tipo de token indicado.
 */
Given(
  "que realizo una petición {string} a {string} con token {string}",
  async function (this: any, method: string, endpoint: string, authType: string) {
    if (method.toUpperCase() !== "GET") {
      throw new Error(`Este step solo soporta el método GET. Se recibió: ${method}`);
    }
    await sendGetRequest(resolveEndpoint(endpoint), authType);
    attachReport(this, "request");
    attachReport(this, "token");
  }
);

/**
 * Descarga el archivo de un endpoint binario (p. ej. /documentos/{id}/archivo/descargar).
 */
Given(
  "que descargo el archivo de {string} con token {string}",
  async function (this: any, endpoint: string, authType: string) {
    await sendDownloadRequest(resolveEndpoint(endpoint), authType);
    attachReport(this, "request");
    attachReport(this, "token");
  }
);

/**
 * Prepara (sin ejecutar) una petición GET para luego añadirle parámetros de consulta.
 */
Given(
  "que preparo una petición {string} a {string} con token {string}",
  function (this: any, method: string, endpoint: string, authType: string) {
    if (method.toUpperCase() !== "GET") {
      throw new Error(`Este step solo soporta el método GET. Se recibió: ${method}`);
    }
    apiContext.requestEndpoint = endpoint;
    apiContext.requestAuthType = authType;
    apiContext.requestQueryParams = new Map();
    apiContext.attachData.method = "GET";
    apiContext.attachData.requestBody = null;
    attachReport(this, "token", authType);
  }
);

/**
 * Fija un parámetro de consulta unitario (útil para Scenario Outline de validaciones).
 */
Given(/^con el parámetro de consulta (.*?) fijado a (.*)$/, function (this: any, parametro: string, valor: string) {
  let valorLimpio = valor.trim();
  if (valorLimpio.startsWith('"') && valorLimpio.endsWith('"')) {
    valorLimpio = valorLimpio.substring(1, valorLimpio.length - 1);
  }
  apiContext.requestQueryParams.set(parametro.trim(), valorLimpio);
  attachJsonToReport(this, { [parametro.trim()]: valorLimpio }, `ParamUnitario_${parametro.trim()}.json`);
});

/**
 * Añade varios parámetros de consulta desde una tabla del feature.
 */
When("con los siguientes parámetros de consulta:", function (this: any, dataTable: DataTable) {
  const rows = dataTable.rows();
  const paramsObject: Record<string, string> = {};

  for (const [rawParam, rawValue] of rows) {
    const parametro = rawParam.trim();
    let valor = (rawValue ?? "").trim();
    if (valor.startsWith('"') && valor.endsWith('"')) {
      valor = valor.substring(1, valor.length - 1);
    }
    apiContext.requestQueryParams.set(parametro, valor);
    paramsObject[parametro] = valor;
  }

  attachJsonToReport(this, paramsObject, "RequestQueryParams.json");
});

/**
 * Ejecuta la petición GET previamente preparada (con sus parámetros de consulta).
 */
When("ejecuto la petición GET", async function (this: any) {
  const { requestEndpoint, requestAuthType, requestQueryParams } = apiContext;

  if (!requestEndpoint || !requestAuthType) {
    throw new Error('La petición GET no fue preparada. Falta el step "Given que preparo...".');
  }

  const urlParams = new URLSearchParams();
  requestQueryParams.forEach((valor, key) => {
    if (valor !== null && valor !== undefined) {
      urlParams.append(key, String(valor));
    }
  });

  const resolvedEndpoint = resolveEndpoint(requestEndpoint);
  const queryString = urlParams.toString();
  const finalEndpoint = queryString ? `${resolvedEndpoint}?${queryString}` : resolvedEndpoint;

  await sendGetRequest(finalEndpoint, requestAuthType);

  apiContext.attachData.url = `${process.env.API_BASEURL}${finalEndpoint}`;
  attachReport(this, "request");
});
