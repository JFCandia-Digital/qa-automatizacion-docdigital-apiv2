import { Given } from "@cucumber/cucumber";
import fs from "fs";
import path from "path";
import { sendPostRequestWithJson } from "../../../common/support/apiClient";
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

/**
 * POST /documentos/firmado/ingresar (JSON + PDF en base64). DESPACHA de verdad.
 * QA responde 415 a multipart/form-data (el endpoint consume application/json;
 * el caso {} → 400 "El nombre del documento es obligatorio" lo confirma).
 * Destinatario OBLIGATORIO vía DESTINATARIO_ENTIDAD_ID.
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

    const folio = `QA-${Date.now()}`;
    const pdfBase64 = fs.readFileSync(this.pdfFirmado.filePath).toString("base64");
    const body = {
      nombre: "Documento QA automatizacion KE-Test2019",
      tipo_id: Number(process.env.TIPO_DOCUMENTO_ID || "1"),
      entidad_id: Number(destinatario),
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
