"use client";

import { useState, useTransition, useActionState } from "react";
import Link from "next/link";
import { tambahSiswaAction, hapusSiswaAction, SiswaActionResult } from "@/app/actions/siswa";
import { logoutAdminAction } from "@/app/actions/auth";

export interface SiswaWithCount {
  id: number;
  nama: string;
  kelas: string;
  tempat_pkl: string;
  pembimbing: string;
  kode: string;
  totalJurnal: number;
}

interface SiswaClientProps {
  initialSiswaList: SiswaWithCount[];
}

export default function SiswaClient({ initialSiswaList }: SiswaClientProps) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [state, formAction, isFormPending] = useActionState<SiswaActionResult | null, FormData>(
    tambahSiswaAction,
    null
  );

  const [isDeletePending, startDeleteTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCopyCode = (kode: string) => {
    navigator.clipboard.writeText(kode);
    setCopiedCode(kode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleHapusSiswa = (siswa: SiswaWithCount) => {
    // Validasi di UI sebelum kirim
    if (siswa.totalJurnal > 0) {
      setFeedback({
        type: "error",
        text: `Siswa "${siswa.nama}" tidak dapat dihapus karena sudah memiliki ${siswa.totalJurnal} catatan jurnal PKL.`,
      });
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus siswa "${siswa.nama}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setFeedback(null);
    startDeleteTransition(async () => {
      const res = await hapusSiswaAction(siswa.id);
      if (res.success) {
        setFeedback({ type: "success", text: res.message });
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              &larr; Kembali ke Rekap Admin
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFormModal(true)}
              className="text-xs sm:text-sm font-medium px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Tambah Siswa Baru</span>
            </button>

            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Kelola Data Siswa PKL
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Daftar seluruh siswa, kode rahasia unik untuk login siswa, dan status pengisian jurnal.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 self-start sm:self-auto shadow-sm">
            Total {initialSiswaList.length} Siswa
          </span>
        </div>

        {/* Feedback Notifikasi */}
        {(feedback || state?.message) && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
              (state?.message ? state.success : feedback?.type === "success")
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <span>{state?.message || feedback?.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabel Siswa */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Tempat PKL</th>
                  <th className="py-3.5 px-4">Guru Pembimbing</th>
                  <th className="py-3.5 px-4 text-center">Kode Masuk Siswa</th>
                  <th className="py-3.5 px-4 text-center">Riwayat Jurnal</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialSiswaList.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {siswa.nama}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                      {siswa.kelas}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {siswa.tempat_pkl}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {siswa.pembimbing}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {siswa.kode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(siswa.kode)}
                          title="Salin Kode Siswa"
                          className="text-[11px] px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                        >
                          {copiedCode === siswa.kode ? "Tersalin!" : "Salin"}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {siswa.totalJurnal > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {siswa.totalJurnal} Jurnal
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          0 Jurnal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        disabled={isDeletePending}
                        onClick={() => handleHapusSiswa(siswa)}
                        title={
                          siswa.totalJurnal > 0
                            ? "Siswa yang sudah punya jurnal tidak bisa dihapus"
                            : "Hapus siswa ini"
                        }
                        className={`text-xs font-medium px-3 py-1 rounded-lg border transition ${
                          siswa.totalJurnal > 0
                            ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                            : "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 active:bg-red-100"
                        }`}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Tambah Siswa */}
      {showFormModal && !state?.success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Tambah Siswa PKL Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            {state && !state.success && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                {state.message}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              {/* Nama */}
              <div className="space-y-1">
                <label htmlFor="nama" className="block text-xs font-semibold text-slate-700">
                  Nama Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  required
                  maxLength={40}
                  placeholder="Contoh: Muhammad Rian Pratama"
                  defaultValue={state?.fields?.nama || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {state?.errors?.nama && (
                  <p className="text-[11px] text-red-600">{state.errors.nama}</p>
                )}
              </div>

              {/* Kelas */}
              <div className="space-y-1">
                <label htmlFor="kelas" className="block text-xs font-semibold text-slate-700">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  id="kelas"
                  name="kelas"
                  type="text"
                  required
                  placeholder="Contoh: XII RPL 1"
                  defaultValue={state?.fields?.kelas || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Tempat PKL */}
              <div className="space-y-1">
                <label htmlFor="tempat_pkl" className="block text-xs font-semibold text-slate-700">
                  Tempat Praktik Kerja Lapangan (DUDI) <span className="text-red-500">*</span>
                </label>
                <input
                  id="tempat_pkl"
                  name="tempat_pkl"
                  type="text"
                  required
                  placeholder="Contoh: PT Digital Solusindo"
                  defaultValue={state?.fields?.tempat_pkl || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Pembimbing */}
              <div className="space-y-1">
                <label htmlFor="pembimbing" className="block text-xs font-semibold text-slate-700">
                  Guru Pembimbing Sekolah <span className="text-red-500">*</span>
                </label>
                <input
                  id="pembimbing"
                  name="pembimbing"
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.Kom"
                  defaultValue={state?.fields?.pembimbing || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-[11px] leading-relaxed">
                ℹ️ <strong>Kode Siswa Rahasia</strong> akan otomatis digenerate secara acak oleh sistem dan ditampilkan setelah disimpan.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isFormPending}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                >
                  {isFormPending ? "Menyimpan..." : "Simpan Siswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
