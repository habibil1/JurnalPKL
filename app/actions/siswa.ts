"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { getAdminSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export interface SiswaActionResult {
  success: boolean;
  message?: string;
  errors?: {
    nama?: string;
    kelas?: string;
    tempat_pkl?: string;
    pembimbing?: string;
    general?: string;
  };
  fields?: {
    nama?: string;
    kelas?: string;
    tempat_pkl?: string;
    pembimbing?: string;
  };
}

/**
 * Menghasilkan kode acak unik format PKL-XXXX (8 karakter)
 */
async function generateUniqueKodeSiswa(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Hindari karakter membingungkan seperti O/0, I/1
  let attempts = 0;

  while (attempts < 10) {
    attempts++;
    let randomPart = "";
    const randomBytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
      randomPart += chars[randomBytes[i] % chars.length];
    }
    const candidate = `PKL-${randomPart}`;

    const { data: existing } = await supabaseServer
      .from("siswa")
      .select("id")
      .eq("kode", candidate)
      .maybeSingle();

    if (!existing) {
      return candidate;
    }
  }

  // Fallback jika tabrakan terus menerus
  return `PKL-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

/**
 * Server Action: Tambah Siswa Baru
 */
export async function tambahSiswaAction(
  _prevState: SiswaActionResult | null,
  formData: FormData
): Promise<SiswaActionResult> {
  const admin = await getAdminSession();
  if (!admin) {
    return { success: false, message: "Akses ditolak. Sesi admin tidak aktif." };
  }

  const nama = (formData.get("nama") as string || "").trim();
  const kelas = (formData.get("kelas") as string || "").trim();
  const tempat_pkl = (formData.get("tempat_pkl") as string || "").trim();
  const pembimbing = (formData.get("pembimbing") as string || "").trim();

  const fields = { nama, kelas, tempat_pkl, pembimbing };
  const errors: SiswaActionResult["errors"] = {};

  // 1. Validasi Nama (3-40 huruf)
  if (!nama) {
    errors.nama = "Nama siswa wajib diisi.";
  } else if (nama.length < 3 || nama.length > 40) {
    errors.nama = `Nama siswa harus antara 3 hingga 40 huruf (saat ini: ${nama.length} huruf).`;
  }

  // 2. Validasi Kelas
  if (!kelas) {
    errors.kelas = "Kelas wajib diisi.";
  }

  // 3. Validasi Tempat PKL
  if (!tempat_pkl) {
    errors.tempat_pkl = "Tempat PKL wajib diisi.";
  }

  // 4. Validasi Pembimbing
  if (!pembimbing) {
    errors.pembimbing = "Nama guru pembimbing wajib diisi.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Mohon lengkapi formulir dengan benar.",
      errors,
      fields,
    };
  }

  try {
    // Generate kode acak otomatis
    const kode = await generateUniqueKodeSiswa();

    const { error: insertError } = await supabaseServer.from("siswa").insert({
      nama,
      kelas,
      tempat_pkl,
      pembimbing,
      kode,
    });

    if (insertError) {
      return {
        success: false,
        message: "Gagal menyimpan data siswa: " + insertError.message,
        fields,
      };
    }

    revalidatePath("/admin/siswa");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Siswa ${nama} berhasil ditambahkan dengan kode masuk: ${kode}`,
    };
  } catch (err) {
    console.error("Kesalahan tambah siswa:", err);
    return {
      success: false,
      message: "Terjadi gangguan server saat menambahkan siswa.",
      fields,
    };
  }
}

/**
 * Server Action: Hapus Siswa
 */
export async function hapusSiswaAction(siswaId: number): Promise<{ success: boolean; message: string }> {
  const admin = await getAdminSession();
  if (!admin) {
    return { success: false, message: "Akses ditolak. Sesi admin tidak aktif." };
  }

  try {
    // Aturan bisnis wajib: Siswa yang sudah punya jurnal tidak bisa dihapus
    const { count, error: countErr } = await supabaseServer
      .from("jurnal")
      .select("id", { count: "exact", head: true })
      .eq("siswa_id", siswaId);

    if (countErr) {
      return { success: false, message: "Gagal memeriksa status jurnal siswa: " + countErr.message };
    }

    if (count && count > 0) {
      return {
        success: false,
        message: `Siswa ini tidak dapat dihapus karena sudah memiliki ${count} catatan jurnal kegiatan PKL.`,
      };
    }

    // Eksekusi hapus jika tidak memiliki jurnal
    const { error: deleteErr } = await supabaseServer
      .from("siswa")
      .delete()
      .eq("id", siswaId);

    if (deleteErr) {
      return { success: false, message: "Gagal menghapus siswa: " + deleteErr.message };
    }

    revalidatePath("/admin/siswa");
    revalidatePath("/admin");

    return { success: true, message: "Data siswa berhasil dihapus." };
  } catch (err) {
    console.error("Kesalahan hapus siswa:", err);
    return { success: false, message: "Terjadi kesalahan server saat menghapus siswa." };
  }
}
