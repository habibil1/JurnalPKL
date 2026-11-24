import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import AdminClient, { SiswaData, JurnalWithSiswa, RekapItem } from "./AdminClient";

export default async function AdminDashboardPage() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/login");
  }

  // 1. Ambil seluruh data siswa
  const { data: siswaData, error: errSiswa } = await supabaseServer
    .from("siswa")
    .select("id, nama, kelas, tempat_pkl, pembimbing")
    .order("id", { ascending: true });

  const siswaList: SiswaData[] = siswaData || [];

  // 2. Ambil seluruh jurnal (tanpa embedding join PostgREST agar kebal dari keterbatasan schema cache)
  const { data: jurnalData, error: errJurnal } = await supabaseServer
    .from("jurnal")
    .select("*")
    .order("tanggal", { ascending: false });

  if (errSiswa || errJurnal) {
    console.error("Kesalahan fetch admin:", errSiswa?.message || errJurnal?.message || errSiswa || errJurnal);
  }

  // Pasangkan data siswa ke tiap jurnal secara in-memory di server
  const siswaMap = new Map(siswaList.map((s) => [s.id, s]));

  const rawJurnal = jurnalData || [];
  const jurnalList: JurnalWithSiswa[] = rawJurnal.map((j) => {
    const s = siswaMap.get(j.siswa_id);
    return {
      ...j,
      siswa: s
        ? {
            nama: s.nama,
            kelas: s.kelas,
            tempat_pkl: s.tempat_pkl,
          }
        : undefined,
    };
  });

  // 3. Hitung rekap per siswa: jumlah jurnal, total jam, menunggu verifikasi
  const rekapList: RekapItem[] = siswaList.map((s) => {
    const siswaJournals = jurnalList.filter((j) => j.siswa_id === s.id);
    const totalJurnal = siswaJournals.length;
    const totalJam = siswaJournals.reduce((acc, curr) => acc + (curr.durasi_jam || 0), 0);
    const menunggu = siswaJournals.filter((j) => j.status === "diajukan").length;

    return {
      id: s.id,
      nama: s.nama,
      kelas: s.kelas,
      tempat_pkl: s.tempat_pkl,
      pembimbing: s.pembimbing,
      totalJurnal,
      totalJam,
      menunggu,
    };
  });

  return (
    <AdminClient
      rekapList={rekapList}
      jurnalList={jurnalList}
      siswaList={siswaList}
    />
  );
}
