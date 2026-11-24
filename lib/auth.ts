import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "fallback_default_secret_pkl_2026";
const SISWA_COOKIE_NAME = "jurnalpkl_siswa_session";
const ADMIN_COOKIE_NAME = "jurnalpkl_admin_session";

export interface SiswaSession {
  id: number;
  nama: string;
  kelas: string;
  tempat_pkl: string;
  pembimbing: string;
  kode: string;
}

export interface AdminSession {
  role: "admin";
}

/**
 * Membuat token bertanda tangan HMAC SHA-256
 */
function signToken(data: object): string {
  const jsonStr = JSON.stringify(data);
  const base64Data = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(base64Data)
    .digest("base64url");
  return `${base64Data}.${signature}`;
}

/**
 * Memverifikasi token bertanda tangan HMAC SHA-256
 */
function verifyToken<T>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [base64Data, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(base64Data)
      .digest("base64url");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const jsonStr = Buffer.from(base64Data, "base64url").toString("utf-8");
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

// =================== SESI SISWA ===================

export async function setSiswaSession(siswa: SiswaSession) {
  const cookieStore = await cookies();
  const token = signToken(siswa);

  cookieStore.set(SISWA_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
}

export async function getSiswaSession(): Promise<SiswaSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SISWA_COOKIE_NAME);
  if (!cookie?.value) return null;

  return verifyToken<SiswaSession>(cookie.value);
}

export async function clearSiswaSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SISWA_COOKIE_NAME);
}

// =================== SESI ADMIN ===================

export async function setAdminSession() {
  const cookieStore = await cookies();
  const token = signToken({ role: "admin" });

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!cookie?.value) return null;

  return verifyToken<AdminSession>(cookie.value);
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
