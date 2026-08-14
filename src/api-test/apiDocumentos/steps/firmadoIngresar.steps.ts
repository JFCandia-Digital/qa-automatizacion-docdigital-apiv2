import { Given } from "@cucumber/cucumber";
import fs from "fs";
import path from "path";
import { sendPostRequestWithJson } from "../../../common/support/apiClient";
import { apiContext } from "../../../common/support/apiContext";
import { attachReport, attachJsonToReport } from "../../../common/utils/utils";

const FILES_DIR = path.join(process.cwd(), "src", "data", "files");

/**
 * Carga un PDF de src/data/files y lo deja en this.pdfFirmado.
 */
Given("que cargo el PDF firmado {string}", function (this: any, fileName: string) {
  const filePath = path.join(FILES_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontró el PDF '${fileName}' en ${FILES_DIR}`);
  }
  this.pdfFirmado = { fileName, filePath };
  attachJsonToReport(this, { fileName, filePath }, "PdfFirmado.json");
});

function entidadIdDesdeJwt(token: string | undefined): number | undefined {
  if (!token) return undefined;
  try {
    const payloadB64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!payloadB64) return undefined;
    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));
    const id = payload?.acr?.entidadId;
    const n = Number(id);
    return Number.isFinite(n) ? n : undefined;
  } catch {
    return undefined;
  }
}

/**
 * POST /documentos/firmado/ingresar (JSON + PDF en base64). DESPACHA de verdad.
 * Contrato QA (Swagger): application/json con id_entidad_creadora y
 * listado_id_entidades_destinatarias (multipart → 415; entidad_id → 400).
 */
Given(
  "que ingreso y despacho el documento firmado a la entidad de prueba con token {string}",
  async function (this: any, authType: string) {
    const destinatario = (process.env.DESTINATARIO_ENTIDAD_ID || "").trim();
    if (!destinatario) {
      throw new Error(
        "Falta DESTINATARIO_ENTIDAD_ID en .env. Debe ser el ID de una entidad de PRUEBA (p. ej. Test 2019). Nunca una institución real."
      );
    }
    if (!this.pdfFirmado?.filePath) {
      throw new Error('Falta el step "que cargo el PDF firmado ...".');
    }

    const token = apiContext.token ?? process.env.ACCESS_TOKEN;
    const creadora =
      Number(process.env.ID_ENTIDAD_CREADORA || "") || entidadIdDesdeJwt(token);
    if (!creadora) {
      throw new Error(
        "Falta ID_ENTIDAD_CREADORA en .env (o un ACCESS_TOKEN JWT con acr.entidadId). En QA PDI es 66."
      );
    }

    const folio = `QA-${Date.now()}`;
    const pdfBase64 = fs.readFileSync(this.pdfFirmado.filePath).toString("base64");
    const body = {
      nombre: "Documento QA automatizacion KE-Test2019",
      tipo_id: Number(process.env.TIPO_DOCUMENTO_ID || "1"),
      id_entidad_creadora: creadora,
      listado_id_entidades_destinatarias: [Number(destinatario)],
      folio,
      materia: "Prueba de automatizacion QA (entidad de prueba -> Test 2019)",
      documento: pdfBase64,
    };

    attachJsonToReport(
      this,
      {
        ...body,
        documento: `<base64 ${this.pdfFirmado.fileName}, ${pdfBase64.length} chars>`,
      },
      "RequestJsonFirmado.json"
    );

    await sendPostRequestWithJson("/documentos/firmado/ingresar", authType, body);
    attachReport(this, "request");
    attachReport(this, "token");
  }
);
