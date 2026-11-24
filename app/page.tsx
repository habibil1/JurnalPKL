import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-slate-800 flex flex-col justify-between">
      {/* Header / Navbar */}
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/30">
              J
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-900">
              Jurnal PKL
            </span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100"
          >
            Masuk Admin &rarr;
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs sm:text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Aplikasi Jurnal Harian Praktik Kerja Lapangan
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Catat Kegiatan PKL Lebih{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Mudah & Tertib
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
              Tulis jurnal harian langsung secara daring dengan kode unik siswa.
              Dapatkan umpan balik, revisi, dan persetujuan dari guru pembimbing secara transparan.
            </p>
          </div>

          {/* Action Cards / Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/masuk"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Masuk sebagai Murid
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-300 shadow-sm transition-all hover:border-slate-400"
            >
              Portal Guru & Pembimbing
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-2">
                1
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Kode Unik Pribadi</h3>
              <p className="text-xs text-slate-600">
                Akses jurnal tanpa repot mengingat kata sandi, cukup gunakan kode siswa rahasia Anda.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-2">
                2
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Validasi Tepat Waktu</h3>
              <p className="text-xs text-slate-600">
                Pengisian terjaga maksimal 7 hari ke belakang dan maksimal 1 jurnal per hari.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-2">
                3
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Evaluasi Pembimbing</h3>
              <p className="text-xs text-slate-600">
                Guru pembimbing dapat menyetujui langsung atau memberikan arahan revisi.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Aplikasi Jurnal PKL &bull; Ujian Kompetensi Web Developer
      </footer>
    </div>
  );
}
