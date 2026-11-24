"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export interface AdminActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Server Action: Menyetujui Jurnal
 */
export async function setujuiJurnalAction(jurnalId: number): Promise<AdminActionResult> {
  const admin = await getAdminSession();
  if (!admin) {
    return { success: false, message: "Akses ditolak. Sesi admin tidak aktif." };
  }

  try {
    const { error } = await supabaseServer
      .from("jurnal")
      .update({
        status: "disetujui",
      })
      .eq("id", jurnalId);

    if (error) {
      return { success: false, message: "Gagal menyetujui jurnal: " + error.message };
    }

    revalidatePath("/admin");
    return { success: true, message: "Jurnal berhasil disetujui." };
  } catch (err) {
    console.error("Kesalahan setujui jurnal:", err);
    return { success: false, message: "Terjadi kesalahan server." };
  }
}

/**
 * Server Action: Meminta Revisi Jurnal dengan Catatan
 */
export async function revisiJurnalAction(
  jurnalId: number,
  catatan: string
): Promise<AdminActionResult> {
  const admin = await getAdminSession();
  if (!admin) {
    return { success: false, message: "Akses ditolak. Sesi admin tidak aktif." };
  }

  const cleanCatatan = (catatan || "").trim();

  // Aturan Wajib: Revisi dari guru wajib punya catatan (minimal 5 huruf)
  if (cleanCatatan.length < 5) {
    return {
      success: false,
      message: "Catatan revisi wajib diisi minimal 5 karakter agar siswa memahami perbaikan.",
      error: "Catatan minimal 5 huruf.",
    };
  }

  try {
    const { error } = await supabaseServer
      .from("jurnal")
      .update({
        status: "revisi",
        catatan: cleanCatatan,
      })
      .eq("id", jurnalId);

    if (error) {
      return { success: false, message: "Gagal meminta revisi jurnal: " + error.message };
    }

    revalidatePath("/admin");
    return { success: true, message: "Status jurnal berhasil diubah menjadi revisi." };
  } catch (err) {
    console.error("Kesalahan revisi jurnal:", err);
    return { success: false, message: "Terjadi kesalahan server." };
  }
}
