import { Given } from "@cucumber/cucumber";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import { sendPostMultipartRequest } from "../../../common/support/apiClient";
import { attachReport, attachJsonToReport } from "../../../common/utils/utils";

const FILES_DIR = path.join(process.cwd(), "src", "data", "files");

/**
 * Carga un PDF de src/data/files y lo deja en this.pdfFirmado para el POST multipart.
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
 * POST /documentos/firmado/ingresar (multipart). DESPACHA de verdad.
 * Destinatario OBLIGATORIO vía DESTINATARIO_ENTIDAD_ID (debe ser una entidad de
 * prueba, p. ej. Test 2019). Nunca una institución real.
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
    const tipoId = process.env.TIPO_DOCUMENTO_ID || "1";
    const campos = {
      nombre: "Documento QA automatizacion KE-Test2019",
      tipo_id: tipoId,
      entidad_id: destinatario,
      folio,
      materia: "Prueba de automatizacion QA (entidad de prueba -> Test 2019)",
    };

    const form = new FormData();
    for (const [k, v] of Object.entries(campos)) {
      form.append(k, String(v));
    }
    form.append("documento", fs.createReadStream(this.pdfFirmado.filePath), {
      filename: this.pdfFirmado.fileName,
      contentType: "application/pdf",
    });

    attachJsonToReport(
      this,
      { ...campos, archivo: this.pdfFirmado.fileName },
      "RequestMultipartFirmado.json"
    );

    await sendPostMultipartRequest("/documentos/firmado/ingresar", authType, form, {
      ...campos,
      archivo: this.pdfFirmado.fileName,
    });
    attachReport(this, "request");
    attachReport(this, "token");
  }
);
