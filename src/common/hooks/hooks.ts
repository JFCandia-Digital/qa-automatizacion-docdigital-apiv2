import { Before, ITestCaseHookParameter, setDefaultTimeout } from "@cucumber/cucumber";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { apiContext } from "../support/apiContext";
import { resolveValidToken } from "../support/oauth";

setDefaultTimeout(60_000);
loadDotEnv();

/**
 * Carga `.env` desde el cwd. En Windows el Bloc de notas / Set-Content a veces
 * guardan UTF-16; dotenv solo parsea UTF-8 y deja variables como DESTINATARIO
 * vacías. Si tras dotenv sigue faltando, releemos el archivo con el encoding real.
 */
function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  dotenv.config({ path: envPath });
  if (!fs.existsSync(envPath)) return;

  const buf = fs.readFileSync(envPath);
  const utf16 = buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe;
  const utf16be = buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff;
  const text = utf16
    ? buf.toString("utf16le")
    : utf16be
      ? buf.swap16().toString("utf16le")
      : buf.toString("utf8").replace(/^\uFEFF/, "");

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

Before(async function ({ pickle }: ITestCaseHookParameter) {
  apiContext.token = null;
  apiContext.response = null;
  apiContext.requestTimestamp = null;
  apiContext.requestEndpoint = null;
  apiContext.requestAuthType = null;
  apiContext.requestQueryParams = new Map();
  apiContext.worldData = new Map();
  apiContext.responseByteLength = undefined;
  apiContext.responseContentType = undefined;
  apiContext.attachData = {};

  const tags = pickle.tags.map((t) => t.name);
  const asRecipient = tags.includes("@AcusoRecibo") || tags.includes("@Devolver");
  apiContext.token = (await resolveValidToken(asRecipient)) ?? null;
});
