"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import {
  setSiswaSession,
  clearSiswaSession,
  setAdminSession,
  clearAdminSession,
} from "@/lib/auth";

export interface ActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

/**
 * Server Action: Masuk Siswa dengan Kode
 */
export async function masukSiswaAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawKode = formData.get("kode");
  const kode = typeof rawKode === "string" ? rawKode.trim().toUpperCase() : "";

  if (!kode) {
    return {
      success: false,
      message: "Silakan masukkan kode siswa.",
      errors: { kode: "Kode siswa wajib diisi." },
    };
  }

  if (kode.length < 6 || kode.length > 12) {
    return {
      success: false,
      message: "Kode siswa harus berukuran 6 hingga 12 karakter.",
      errors: { kode: "Panjang kode antara 6 sampai 12 karakter." },
    };
  }

  try {
    // Ambil data siswa berdasarkan kode dari Supabase
    const { data: siswa, error } = await supabaseServer
      .from("siswa")
      .select("id, nama, kelas, tempat_pkl, pembimbing, kode")
      .eq("kode", kode)
      .single();

    if (error || !siswa) {
      return {
        success: false,
        message: "Kode siswa tidak ditemukan atau belum terdaftar. Periksa kembali kode Anda.",
        errors: { kode: "Kode siswa tidak valid." },
      };
    }

    // Set sesi cookie HTTP-Only bertanda tangan rahasia
    await setSiswaSession({
      id: siswa.id,
      nama: siswa.nama,
      kelas: siswa.kelas,
      tempat_pkl: siswa.tempat_pkl,
      pembimbing: siswa.pembimbing,
      kode: siswa.kode,
    });
  } catch (err) {
    console.error("Kesalahan saat login siswa:", err);
    return {
      success: false,
      message: "Terjadi gangguan saat memverifikasi kode. Silakan coba beberapa saat lagi.",
    };
  }

  // Alihkan ke halaman dashboard jurnal murid
  redirect("/jurnal");
}

/**
 * Server Action: Login Admin dengan Kata Sandi
 */
export async function loginAdminAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawPassword = formData.get("password");
  const password = typeof rawPassword === "string" ? rawPassword : "";

  if (!password) {
    return {
      success: false,
      message: "Kata sandi wajib diisi.",
      errors: { password: "Kata sandi tidak boleh kosong." },
    };
  }

  const expectedPassword = process.env.ADMIN_PASSWORD || "adminpkl2026";

  if (password !== expectedPassword) {
    return {
      success: false,
      message: "Kata sandi salah. Silakan periksa kembali kata sandi yang Anda masukkan.",
      errors: { password: "Kata sandi tidak sesuai." },
    };
  }

  // Set sesi cookie admin
  await setAdminSession();

  // Alihkan ke portal admin
  redirect("/admin");
}

/**
 * Server Action: Logout Murid
 */
export async function logoutSiswaAction() {
  await clearSiswaSession();
  redirect("/masuk");
}

/**
 * Server Action: Logout Admin
 */
export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/login");
}
