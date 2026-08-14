/**
 * Genera un reporte HTML amigable (dashboard con gráficos, features y pasos)
 * a partir del JSON de Cucumber, usando multiple-cucumber-html-reporter.
 *
 * Uso:
 *   npm run report        # genera el reporte (a partir de la última corrida)
 *   npm run report:open   # genera y lo abre en el navegador
 *
 * El JSON lo produce Cucumber en reports/json/ (ver cucumber.cjs).
 */
const fs = require("fs");
const path = require("path");
const report = require("multiple-cucumber-html-reporter");

const jsonDir = path.join("reports", "json");
const reportPath = path.join("reports", "html");
const jsonFile = path.join(jsonDir, "cucumber-report.json");

if (!fs.existsSync(jsonFile)) {
  console.error(
    `No se encontró ${jsonFile}.\nEjecuta primero las pruebas (p. ej. "npm run apiTest" o "npm run negativo") y luego "npm run report".`
  );
  process.exit(1);
}

const openReportInBrowser = process.argv.includes("--open");

report.generate({
  jsonDir,
  reportPath,
  openReportInBrowser,
  pageTitle: "QA Automatización — DocDigital APIv2",
  reportName: "Regresión APIv2 (DocDigital)",
  displayDuration: true,
  metadata: {
    browser: { name: "axios", version: "-" },
    device: "Cucumber + TypeScript",
    platform: { name: "DocDigital APIv2 (demodoc)", version: "-" },
  },
  customData: {
    title: "Información de la ejecución",
    data: [
      { label: "Proyecto", value: "qa-automatizacion-docdigital-apiv2" },
      { label: "Tipo", value: "Regresión de API" },
      { label: "Ambiente", value: process.env.API_BASEURL || "https://api-demodoc.digital.gob.cl/api" },
      { label: "Fecha", value: new Date().toLocaleString() },
    ],
  },
});

console.log(`\nReporte generado en: ${path.join(reportPath, "index.html")}`);
