import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSiswaSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import EditForm from "./EditForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UbahJurnalPage({ params }: PageProps) {
  const siswa = await getSiswaSession();
  if (!siswa) {
    redirect("/masuk");
  }

  const { id } = await params;
  const jurnalId = parseInt(id, 10);
  if (isNaN(jurnalId)) {
    notFound();
  }

  // Ambil data jurnal
  const { data: jurnal, error } = await supabaseServer
    .from("jurnal")
    .select("*")
    .eq("id", jurnalId)
    .single();

  // Aturan bisnis penting: Jurnal milik siswa lain tampil 404
  if (error || !jurnal || jurnal.siswa_id !== siswa.id) {
    notFound();
  }

  // Aturan bisnis: Jurnal disetujui terkunci (tidak bisa diubah)
  const isLocked = jurnal.status === "disetujui";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/jurnal"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
          >
            &larr; Kembali ke Daftar Jurnal
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            Ubah Jurnal #{jurnal.id}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Perbarui Jurnal Harian
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Perbaiki rincian kegiatan atau tanggapi catatan revisi dari guru pembimbing.
            </p>
          </div>

          {isLocked ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl mx-auto">
                🔒
              </div>
              <h3 className="font-bold text-base">Jurnal Telah Disetujui (Terkunci)</h3>
              <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto">
                Jurnal ini sudah diverifikasi dan disetujui oleh guru pembimbing, sehingga tidak dapat diubah lagi sesuai ketentuan penilaian.
              </p>
              <div className="pt-2">
                <Link
                  href="/jurnal"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-medium hover:bg-emerald-800 transition shadow-sm"
                >
                  Kembali ke Jurnal
                </Link>
              </div>
            </div>
          ) : (
            <EditForm jurnal={jurnal} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        Aplikasi Jurnal PKL &bull; Portal Siswa
      </footer>
    </div>
  );
}
