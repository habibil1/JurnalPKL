import { redirect } from "next/navigation";
import Link from "next/link";
import { getSiswaSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import { logoutSiswaAction } from "@/app/actions/auth";

interface JurnalItem {
  id: number;
  siswa_id: number;
  tanggal: string;
  kegiatan: string;
  kompetensi: string;
  durasi_jam: number;
  status: "diajukan" | "disetujui" | "revisi";
  catatan: string | null;
  dibuat: string;
}

export default async function JurnalDashboardPage() {
  const siswa = await getSiswaSession();

  // Proteksi rute: jika belum login murid, arahkan ke /masuk
  if (!siswa) {
    redirect("/masuk");
  }

  // Ambil daftar jurnal khusus milik murid ini (berdasarkan siswa.id di sesi)
  const { data: jurnalList, error } = await supabaseServer
    .from("jurnal")
    .select("*")
    .eq("siswa_id", siswa.id)
    .order("tanggal", { ascending: false });

  const journals: JurnalItem[] = jurnalList || [];

  // Hitung ringkasan statistik
  const totalJam = journals.reduce((acc, curr) => acc + (curr.durasi_jam || 0), 0);
  const totalDisetujui = journals.filter((j) => j.status === "disetujui").length;
  const totalDiajukan = journals.filter((j) => j.status === "diajukan").length;
  const totalRevisi = journals.filter((j) => j.status === "revisi").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              J
            </div>
            <div>
              <span className="font-semibold text-slate-900 block leading-tight text-sm sm:text-base">
                Portal Jurnal PKL
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {siswa.kelas}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/jurnal/baru"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-sm transition"
            >
              <span>+</span>
              <span>Tulis Jurnal</span>
            </Link>

            <form action={logoutSiswaAction}>
              <button
                type="submit"
                className="text-xs sm:text-sm font-medium text-slate-600 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition border border-transparent hover:border-red-200"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Banner Profil Siswa */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                Selamat Datang
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {siswa.nama}
              </h1>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-blue-100 pt-1">
                <span>
                  Tempat PKL: <strong>{siswa.tempat_pkl}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Pembimbing: <strong>{siswa.pembimbing}</strong>
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-center sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 block">
                Total Jam Diakui
              </span>
              <span className="text-2xl sm:text-3xl font-black">
                {totalJam} <span className="text-sm font-normal text-blue-100">Jam</span>
              </span>
            </div>
          </div>
        </section>

        {/* Ringkasan Status */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium block">Total Jurnal</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              {journals.length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-emerald-600 font-medium block">Disetujui</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">
              {totalDisetujui}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-amber-600 font-medium block">Menunggu Konfirmasi</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">
              {totalDiajukan}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-red-600 font-medium block">Perlu Revisi</span>
            <span className="text-2xl font-bold text-red-600 mt-1 block">
              {totalRevisi}
            </span>
          </div>
        </section>

        {/* Notifikasi Error DB jika ada */}
        {error && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm">
            Gagal mengambil data jurnal dari basis data: {error.message}
          </div>
        )}

        {/* Daftar Jurnal Harian */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Riwayat Jurnal Harian
            </h2>
            <span className="text-xs text-slate-500">
              Menampilkan {journals.length} jurnal
            </span>
          </div>

          {journals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mx-auto">
                📝
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900">Belum ada jurnal harian</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Anda belum mengisi catatan kegiatan PKL. Mulai catat kegiatan pertama Anda sekarang.
                </p>
              </div>
              <Link
                href="/jurnal/baru"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium transition shadow-sm"
              >
                + Tulis Jurnal Pertama
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {journals.map((jurnal) => (
                <div
                  key={jurnal.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 transition hover:border-slate-300 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {new Date(jurnal.tanggal).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {jurnal.durasi_jam} Jam
                        </span>
                      </div>
                      <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        Kompetensi: {jurnal.kompetensi}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Badges */}
                      {jurnal.status === "disetujui" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Disetujui (Terkunci)
                        </span>
                      )}

                      {jurnal.status === "diajukan" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Diajukan
                        </span>
                      )}

                      {jurnal.status === "revisi" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Perlu Revisi
                        </span>
                      )}

                      {/* Tombol Ubah (Hanya bisa bila status belum disetujui) */}
                      {jurnal.status !== "disetujui" && (
                        <Link
                          href={`/jurnal/${jurnal.id}/ubah`}
                          className="text-xs font-medium px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition ml-2"
                        >
                          Ubah
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Isi Kegiatan */}
                  <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {jurnal.kegiatan}
                  </div>

                  {/* Kotak Catatan Revisi jika ada */}
                  {jurnal.status === "revisi" && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs sm:text-sm text-red-900 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5 text-red-800">
                        <span>⚠️</span>
                        <span>Catatan Revisi dari Guru Pembimbing:</span>
                      </div>
                      <p className="italic pl-5">
                        &quot;{jurnal.catatan || "Mohon perbaiki deskripsi kegiatan sesuai petunjuk."}&quot;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        Aplikasi Jurnal PKL &bull; Sesi Siswa Aktif
      </footer>
    </div>
  );
}
