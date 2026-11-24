import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import SiswaClient, { SiswaWithCount } from "./SiswaClient";

export default async function AdminKelolaSiswaPage() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/login");
  }

  // Ambil data seluruh siswa beserta kode rahasianya (khusus akses admin)
  const { data: siswaData, error: errSiswa } = await supabaseServer
    .from("siswa")
    .select("id, nama, kelas, tempat_pkl, pembimbing, kode")
    .order("id", { ascending: true });

  // Ambil jumlah jurnal per siswa
  const { data: jurnalData, error: errJurnal } = await supabaseServer
    .from("jurnal")
    .select("siswa_id");

  if (errSiswa || errJurnal) {
    console.error(
      "Kesalahan fetch kelola siswa:",
      errSiswa?.message || errJurnal?.message || "Periksa konfigurasi Supabase dan pastikan skrip database.sql sudah dijalankan di SQL Editor Supabase."
    );
  }

  const rawSiswa = siswaData || [];
  const rawJurnal = jurnalData || [];

  const initialSiswaList: SiswaWithCount[] = rawSiswa.map((s) => {
    const totalJurnal = rawJurnal.filter((j) => j.siswa_id === s.id).length;
    return {
      id: s.id,
      nama: s.nama,
      kelas: s.kelas,
      tempat_pkl: s.tempat_pkl,
      pembimbing: s.pembimbing,
      kode: s.kode,
      totalJurnal,
    };
  });

  return <SiswaClient initialSiswaList={initialSiswaList} />;
}
