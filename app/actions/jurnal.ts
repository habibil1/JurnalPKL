"use server";

import { redirect } from "next/navigation";
import { getSiswaSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export interface JurnalActionResult {
  success: boolean;
  message?: string;
  errors?: {
    tanggal?: string;
    kompetensi?: string;
    durasi_jam?: string;
    kegiatan?: string;
    general?: string;
  };
  fields?: {
    tanggal?: string;
    kompetensi?: string;
    durasi_jam?: string;
    kegiatan?: string;
  };
}

/**
 * Mendapatkan string tanggal hari ini dan batas 7 hari yang lalu (format YYYY-MM-DD)
 */
function getDateBoundaries() {
  const now = new Date();
  // Gunakan zona waktu lokal/WIB jika perlu
  const todayStr = now.toISOString().split("T")[0];

  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 7);
  const minDateStr = pastDate.toISOString().split("T")[0];

  return { todayStr, minDateStr };
}

/**
 * Server Action: Tambah Jurnal Baru
 */
export async function tambahJurnalAction(
  _prevState: JurnalActionResult | null,
  formData: FormData
): Promise<JurnalActionResult> {
  const siswa = await getSiswaSession();
  if (!siswa) {
    redirect("/masuk");
  }

  const tanggal = (formData.get("tanggal") as string || "").trim();
  const kompetensi = (formData.get("kompetensi") as string || "").trim();
  const durasiStr = (formData.get("durasi_jam") as string || "").trim();
  const kegiatan = (formData.get("kegiatan") as string || "").trim();

  const fields = { tanggal, kompetensi, durasi_jam: durasiStr, kegiatan };
  const errors: JurnalActionResult["errors"] = {};

  // 1. Validasi Tanggal
  const { todayStr, minDateStr } = getDateBoundaries();

  if (!tanggal) {
    errors.tanggal = "Tanggal kegiatan wajib diisi.";
  } else if (tanggal > todayStr) {
    errors.tanggal = "Tanggal kegiatan tidak boleh di masa depan.";
  } else if (tanggal < minDateStr) {
    errors.tanggal = `Tanggal kegiatan maksimal 7 hari ke belakang (paling lampau: ${minDateStr}).`;
  }

  // 2. Validasi Kompetensi (3-60 karakter)
  if (!kompetensi) {
    errors.kompetensi = "Kompetensi dasar/keahlian wajib diisi.";
  } else if (kompetensi.length < 3 || kompetensi.length > 60) {
    errors.kompetensi = `Panjang kompetensi harus antara 3 hingga 60 huruf (saat ini: ${kompetensi.length} huruf).`;
  }

  // 3. Validasi Durasi (1-10 jam, bilangan bulat)
  const durasiNum = Number(durasiStr);
  if (!durasiStr) {
    errors.durasi_jam = "Durasi jam kegiatan wajib diisi.";
  } else if (!Number.isInteger(durasiNum) || durasiNum < 1 || durasiNum > 10) {
    errors.durasi_jam = "Durasi harus berupa bilangan bulat antara 1 hingga 10 jam.";
  }

  // 4. Validasi Kegiatan (30-500 karakter)
  if (!kegiatan) {
    errors.kegiatan = "Deskripsi kegiatan jurnal wajib diisi.";
  } else if (kegiatan.length < 30 || kegiatan.length > 500) {
    errors.kegiatan = `Rincian kegiatan harus berisi 30 hingga 500 karakter (saat ini: ${kegiatan.length} karakter).`;
  }

  // Jika ada galat validasi, kembalikan isian form agar pengguna tidak perlu mengetik ulang
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Mohon periksa kembali kolom formulir yang belum sesuai.",
      errors,
      fields,
    };
  }

  // 5. Cek Aturan Bisnis: Satu Jurnal Per Hari
  try {
    const { data: existing, error: checkError } = await supabaseServer
      .from("jurnal")
      .select("id")
      .eq("siswa_id", siswa.id)
      .eq("tanggal", tanggal)
      .maybeSingle();

    if (checkError) {
      console.error("Gagal memeriksa duplikasi jurnal:", checkError);
    }

    if (existing) {
      return {
        success: false,
        message: "Anda sudah memiliki jurnal pada tanggal tersebut. Aturan: maksimal satu jurnal per hari.",
        errors: { tanggal: "Jurnal pada tanggal ini sudah pernah dibuat." },
        fields,
      };
    }

    // Masukkan ke basis data
    const { error: insertError } = await supabaseServer.from("jurnal").insert({
      siswa_id: siswa.id,
      tanggal,
      kompetensi,
      durasi_jam: durasiNum,
      kegiatan,
      status: "diajukan",
      catatan: null,
    });

    if (insertError) {
      console.error("Gagal menambahkan jurnal:", insertError);
      return {
        success: false,
        message: "Gagal menyimpan jurnal ke database: " + insertError.message,
        fields,
      };
    }
  } catch (err) {
    console.error("Kesalahan server saat membuat jurnal:", err);
    return {
      success: false,
      message: "Terjadi gangguan server. Silakan coba kembali nanti.",
      fields,
    };
  }

  redirect("/jurnal");
}

/**
 * Server Action: Ubah Jurnal
 */
export async function ubahJurnalAction(
  id: number,
  _prevState: JurnalActionResult | null,
  formData: FormData
): Promise<JurnalActionResult> {
  const siswa = await getSiswaSession();
  if (!siswa) {
    redirect("/masuk");
  }

  // Ambil data jurnal eksisting untuk memverifikasi kepemilikan dan status
  const { data: currentJurnal, error: fetchErr } = await supabaseServer
    .from("jurnal")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !currentJurnal || currentJurnal.siswa_id !== siswa.id) {
    return {
      success: false,
      message: "Jurnal tidak ditemukan atau Anda tidak memiliki akses untuk mengubahnya.",
    };
  }

  // Aturan bisnis: jurnal disetujui terkunci (tidak bisa diubah)
  if (currentJurnal.status === "disetujui") {
    return {
      success: false,
      message: "Jurnal yang telah disetujui oleh guru pembimbing tidak dapat diubah kembali.",
    };
  }

  const tanggal = (formData.get("tanggal") as string || "").trim();
  const kompetensi = (formData.get("kompetensi") as string || "").trim();
  const durasiStr = (formData.get("durasi_jam") as string || "").trim();
  const kegiatan = (formData.get("kegiatan") as string || "").trim();

  const fields = { tanggal, kompetensi, durasi_jam: durasiStr, kegiatan };
  const errors: JurnalActionResult["errors"] = {};

  const { todayStr, minDateStr } = getDateBoundaries();

  // Validasi Tanggal
  if (!tanggal) {
    errors.tanggal = "Tanggal kegiatan wajib diisi.";
  } else if (tanggal > todayStr) {
    errors.tanggal = "Tanggal kegiatan tidak boleh di masa depan.";
  } else if (tanggal < minDateStr) {
    errors.tanggal = `Tanggal kegiatan maksimal 7 hari ke belakang (paling lampau: ${minDateStr}).`;
  }

  // Validasi Kompetensi
  if (!kompetensi) {
    errors.kompetensi = "Kompetensi dasar/keahlian wajib diisi.";
  } else if (kompetensi.length < 3 || kompetensi.length > 60) {
    errors.kompetensi = `Panjang kompetensi harus antara 3 hingga 60 huruf (saat ini: ${kompetensi.length} huruf).`;
  }

  // Validasi Durasi
  const durasiNum = Number(durasiStr);
  if (!durasiStr) {
    errors.durasi_jam = "Durasi jam kegiatan wajib diisi.";
  } else if (!Number.isInteger(durasiNum) || durasiNum < 1 || durasiNum > 10) {
    errors.durasi_jam = "Durasi harus berupa bilangan bulat antara 1 hingga 10 jam.";
  }

  // Validasi Kegiatan
  if (!kegiatan) {
    errors.kegiatan = "Deskripsi kegiatan jurnal wajib diisi.";
  } else if (kegiatan.length < 30 || kegiatan.length > 500) {
    errors.kegiatan = `Rincian kegiatan harus berisi 30 hingga 500 karakter (saat ini: ${kegiatan.length} karakter).`;
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Mohon periksa kembali kolom formulir yang belum sesuai.",
      errors,
      fields,
    };
  }

  // Cek jika tanggal diubah, pastikan tidak bentrok dengan jurnal lain di hari tersebut
  if (tanggal !== currentJurnal.tanggal) {
    const { data: conflictJurnal } = await supabaseServer
      .from("jurnal")
      .select("id")
      .eq("siswa_id", siswa.id)
      .eq("tanggal", tanggal)
      .neq("id", id)
      .maybeSingle();

    if (conflictJurnal) {
      return {
        success: false,
        message: "Anda sudah memiliki jurnal lain pada tanggal tersebut.",
        errors: { tanggal: "Tanggal ini sudah terisi jurnal lain." },
        fields,
      };
    }
  }

  try {
    // Aturan bisnis: Setelah diubah, jurnal berstatus revisi kembali ke diajukan dan catatan hilang (null)
    const { error: updateError } = await supabaseServer
      .from("jurnal")
      .update({
        tanggal,
        kompetensi,
        durasi_jam: durasiNum,
        kegiatan,
        status: "diajukan",
        catatan: null,
      })
      .eq("id", id)
      .eq("siswa_id", siswa.id);

    if (updateError) {
      return {
        success: false,
        message: "Gagal memperbarui jurnal: " + updateError.message,
        fields,
      };
    }
  } catch (err) {
    console.error("Kesalahan update jurnal:", err);
    return {
      success: false,
      message: "Terjadi kesalahan server saat memperbarui jurnal.",
      fields,
    };
  }

  redirect("/jurnal");
}
