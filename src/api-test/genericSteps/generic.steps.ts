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
  const actual = apiContext.response.data;
  assert.strictEqual(
    typeof actual === "string" ? actual.trim() : actual,
    expected,
    `Cuerpo esperado: '${expected}', recibido: ${JSON.stringify(actual)}`
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
