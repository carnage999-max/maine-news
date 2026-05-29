import { cookies } from "next/headers";

export const SESSION_COOKIE = "se7en_ads_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function sessionSecret() {
  return process.env.CUSTOM_ADS_AUTH_SECRET || process.env.CUSTOM_ADS_ADMIN_PASSWORD || "dev-secret";
}

function expectedUsername() {
  return process.env.CUSTOM_ADS_ADMIN_USERNAME || "admin";
}

function expectedPassword() {
  return process.env.CUSTOM_ADS_ADMIN_PASSWORD || "";
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function authConfigured() {
  return Boolean(expectedPassword());
}

export function validCredentials(username: string, password: string) {
  if (!authConfigured()) return true;
  return username === expectedUsername() && password === expectedPassword();
}

export async function createSessionToken(username: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `v1:${username}:${expiresAt}`;
  const signature = await hmac(payload);

  return `${payload}:${signature}`;
}

export async function verifySessionToken(token?: string) {
  if (!authConfigured()) return true;
  if (!token) return false;

  const parts = token.split(":");
  if (parts.length !== 4) return false;

  const [version, username, expiresAt, signature] = parts;
  if (version !== "v1" || username !== expectedUsername()) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  const expectedSignature = await hmac(`${version}:${username}:${expiresAt}`);
  return signature === expectedSignature;
}

export async function setSessionCookie(username: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await createSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
