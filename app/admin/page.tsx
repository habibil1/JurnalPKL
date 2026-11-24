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

  // 2. Ambil seluruh jurnal beserta relasi siswa
  const { data: jurnalData, error: errJurnal } = await supabaseServer
    .from("jurnal")
    .select("*, siswa:siswa_id(nama, kelas, tempat_pkl)")
    .order("tanggal", { ascending: false });

  const jurnalList: JurnalWithSiswa[] = jurnalData || [];

  if (errSiswa || errJurnal) {
    console.error("Kesalahan fetch admin:", errSiswa || errJurnal);
  }

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
