import axios from "axios";

type TokenSlot = "pdi" | "armada";

const cache: Partial<Record<TokenSlot, { token: string; expMs: number }>> = {};

const SKEW_MS = 60_000;

/**
 * URL del token OAuth. En QA es /api/v3/oauth/token (no /api/oauth/token).
 * Override: OAUTH_TOKEN_URL en .env.
 */
export function oauthTokenUrl(): string {
  const explicit = (process.env.OAUTH_TOKEN_URL || "").trim();
  if (explicit) return explicit;
  const base = (process.env.API_BASEURL || "").replace(/\/$/, "");
  if (/docv3\.test|middleware\.docv3/i.test(base)) {
    return base.replace(/\/api$/i, "/api/v3/oauth/token");
  }
  return `${base}/oauth/token`;
}

function jwtExpMs(token: string): number {
  try {
    const payloadB64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!payloadB64) return Date.now() + 50 * 60 * 1000;
    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));
    const exp = Number(payload?.exp);
    return Number.isFinite(exp) ? exp * 1000 : Date.now() + 50 * 60 * 1000;
  } catch {
    return Date.now() + 50 * 60 * 1000;
  }
}

function isUsable(token: string | undefined, expMs?: number): token is string {
  if (!token) return false;
  const exp = expMs ?? jwtExpMs(token);
  return exp - SKEW_MS > Date.now();
}

async function fetchClientToken(clientId: string, clientSecret: string): Promise<string | null> {
  const url = oauthTokenUrl();
  const response = await axios.post(url, null, {
    auth: { username: clientId, password: clientSecret },
    validateStatus: () => true,
  });
  const token = response.data?.access_token as string | undefined;
  if (response.status !== 200 || !token) {
    console.warn(`[oauth] falló ${url} status=${response.status}`);
    return null;
  }
  return token;
}

async function tokenForSlot(
  slot: TokenSlot,
  clientId: string | undefined,
  clientSecret: string | undefined
): Promise<string | null> {
  const id = (clientId || "").trim();
  const secret = (clientSecret || "").trim();
  if (!id || !secret) return null;

  const cached = cache[slot];
  if (cached && isUsable(cached.token, cached.expMs)) return cached.token;

  const token = await fetchClientToken(id, secret);
  if (!token) return null;
  const expMs = jwtExpMs(token);
  cache[slot] = { token, expMs };
  const mins = Math.max(1, Math.round((expMs - Date.now()) / 60000));
  console.log(`[oauth] token ${slot.toUpperCase()} OK (~${mins} min)`);
  return token;
}

/**
 * Token "válido" para el escenario:
 * - @AcusoRecibo / @Devolver → Armada (receptor), si hay CLIENT_ID_ARMADA
 * - resto → PDI
 * Si hay client_id/secret, se pide el token solo (ACCESS_TOKEN deja de ser obligatorio).
 */
export async function resolveValidToken(asRecipient: boolean): Promise<string | undefined> {
  if (asRecipient) {
    const armada = await tokenForSlot(
      "armada",
      process.env.CLIENT_ID_ARMADA,
      process.env.CLIENT_SECRET_ARMADA
    );
    if (armada) return armada;
  }

  const pdi = await tokenForSlot("pdi", process.env.CLIENT_ID_PDI, process.env.CLIENT_SECRET_PDI);
  if (pdi) return pdi;

  const fallback = (process.env.ACCESS_TOKEN || "").trim();
  if (isUsable(fallback)) return fallback;
  if (fallback) {
    console.warn("[oauth] ACCESS_TOKEN presente pero vencido o inválido; completa CLIENT_ID_PDI/SECRET");
  }
  return fallback || undefined;
}
