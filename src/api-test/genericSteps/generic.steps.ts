import { Then } from "@cucumber/cucumber";
import assert from "assert";
import { apiContext } from "../../common/support/apiContext";
import { successStructures } from "../schemas/schemas";
import { validateStructure, getByPath, hasByPath, attachReport, attachJsonToReport } from "../../common/utils/utils";

Then("el estado de la respuesta debe ser {int}", function (this: any, statusCode: number) {
  attachReport(this, "response");
  assert.strictEqual(
    apiContext.response.status,
    statusCode,
    `Status esperado: ${statusCode}\nStatus recibido: ${apiContext.response.status}\nResponse body: ${JSON.stringify(
      apiContext.response.data,
      null,
      2
    )}`
  );
});

Then("el cuerpo de la respuesta debe tener la propiedad {string}", function (this: any, path: string) {
  attachReport(this, "response");
  assert.ok(
    hasByPath(apiContext.response.data, path),
    `No se encontró la propiedad '${path}' en el cuerpo de la respuesta.`
  );
});

Then(
  "el cuerpo de la respuesta debe tener la propiedad {string} con el valor {}",
  function (this: any, path: string, value: string) {
    attachReport(this, "response");
    let expectedValue: any;
    try {
      expectedValue = JSON.parse(value);
    } catch (e) {
      expectedValue = value;
    }
    const actualValue = getByPath(apiContext.response.data, path);
    assert.deepStrictEqual(
      actualValue,
      expectedValue,
      `Valor esperado en '${path}': ${JSON.stringify(expectedValue)}, recibido: ${JSON.stringify(actualValue)}`
    );
  }
);

Then(
  "el cuerpo de la respuesta debe tener la estructura de éxito {string}",
  function (this: any, structureName: string) {
    attachReport(this, "response");
    const expectedStructure = (successStructures as Record<string, any>)[structureName];
    if (!expectedStructure) {
      throw new Error(
        `La estructura de éxito '${structureName}' no está definida en src/api-test/schemas/schemas.ts`
      );
    }
    attachJsonToReport(this, expectedStructure, `ExpectedSchema_SUCCESS_${structureName}.json`);
    validateStructure(apiContext.response.data, expectedStructure, "");
  }
);

/**
 * Valida el cuerpo de error de APIv2, que es TEXTO PLANO (no un objeto JSON).
 * Ej.: "No autorizado." (token inválido/expirado) o "401 UNAUTHORIZED" (sin token).
 */
Then("el cuerpo de la respuesta debe ser el texto {string}", function (this: any, expected: string) {
  attachReport(this, "response");
  let actual = apiContext.response.data;
  if (Buffer.isBuffer(actual)) actual = actual.toString("utf8");
  assert.strictEqual(
    typeof actual === "string" ? actual.trim() : actual,
    expected,
    `Cuerpo esperado: '${expected}', recibido: ${JSON.stringify(actual)}`
  );
});

/**
 * Valida que la respuesta sea un archivo descargable: contenido no vacío y
 * un Content-Type que no sea JSON (indicando binario/octet-stream/pdf, etc.).
 */
Then("la respuesta debe ser un archivo descargable", function (this: any) {
  const size = apiContext.responseByteLength ?? 0;
  const ct = String(apiContext.responseContentType ?? "");
  this.attach(`Archivo recibido: ${size} bytes, Content-Type: ${ct || "N/A"}`, {
    mediaType: "text/plain",
    fileName: "DownloadInfo.txt",
  });
  assert.ok(size > 0, `El archivo descargado está vacío (0 bytes). Content-Type: ${ct}`);
  assert.ok(
    !ct.includes("application/json"),
    `Se esperaba contenido binario, pero el Content-Type es JSON: ${ct}`
  );
});

Then("el cuerpo de la respuesta debe contener el texto {string}", function (this: any, expected: string) {
  attachReport(this, "response");
  const actual = apiContext.response.data;
  const asText = typeof actual === "string" ? actual : JSON.stringify(actual);
  assert.ok(
    asText.includes(expected),
    `El cuerpo de la respuesta no contiene '${expected}'. Cuerpo recibido: ${asText}`
  );
});
