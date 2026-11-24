"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { setujuiJurnalAction, revisiJurnalAction } from "@/app/actions/admin";
import { logoutAdminAction } from "@/app/actions/auth";

export interface SiswaData {
  id: number;
  nama: string;
  kelas: string;
  tempat_pkl: string;
  pembimbing: string;
  kode?: string;
}

export interface JurnalWithSiswa {
  id: number;
  siswa_id: number;
  tanggal: string;
  kegiatan: string;
  kompetensi: string;
  durasi_jam: number;
  status: "diajukan" | "disetujui" | "revisi";
  catatan: string | null;
  dibuat: string;
  siswa?: {
    nama: string;
    kelas: string;
    tempat_pkl: string;
  };
}

export interface RekapItem {
  id: number;
  nama: string;
  kelas: string;
  tempat_pkl: string;
  pembimbing: string;
  totalJurnal: number;
  totalJam: number;
  menunggu: number;
}

interface AdminClientProps {
  rekapList: RekapItem[];
  jurnalList: JurnalWithSiswa[];
  siswaList: SiswaData[];
}

export default function AdminClient({
  rekapList,
  jurnalList,
  siswaList,
}: AdminClientProps) {
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [filterSiswa, setFilterSiswa] = useState<string>("semua");

  const [activeModalId, setActiveModalId] = useState<number | null>(null);
  const [catatanText, setCatatanText] = useState("");
  const [catatanError, setCatatanError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter jurnal sesuai pilihan
  const filteredJurnal = jurnalList.filter((j) => {
    const matchStatus = filterStatus === "semua" || j.status === filterStatus;
    const matchSiswa = filterSiswa === "semua" || String(j.siswa_id) === filterSiswa;
    return matchStatus && matchSiswa;
  });

  const handleSetujui = (jurnalId: number) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await setujuiJurnalAction(jurnalId);
      if (res.success) {
        setFeedback({ type: "success", text: "Jurnal berhasil disetujui." });
      } else {
        setFeedback({ type: "error", text: res.message || "Gagal menyetujui jurnal." });
      }
    });
  };

  const handleOpenRevisiModal = (jurnal: JurnalWithSiswa) => {
    setActiveModalId(jurnal.id);
    setCatatanText(jurnal.catatan || "");
    setCatatanError(null);
  };

  const handleKirimRevisi = () => {
    if (!activeModalId) return;

    if (catatanText.trim().length < 5) {
      setCatatanError("Catatan revisi wajib minimal 5 karakter.");
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await revisiJurnalAction(activeModalId, catatanText);
      if (res.success) {
        setFeedback({ type: "success", text: "Jurnal berhasil diminta untuk direvisi." });
        setActiveModalId(null);
        setCatatanText("");
      } else {
        setCatatanError(res.message || "Gagal mengirim revisi.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              A
            </div>
            <div>
              <span className="font-semibold text-white block text-sm sm:text-base leading-tight">
                Panel Admin & Guru Pembimbing
              </span>
              <span className="text-[11px] text-slate-400">
                Pemeriksaan Jurnal Harian PKL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/siswa"
              className="text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Kelola Siswa PKL &rarr;
            </Link>

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

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {feedback && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. BAGIAN REKAP PER SISWA */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Rekapitulasi Jurnal Per Siswa
              </h2>
              <p className="text-xs text-slate-500">
                Pantau progres penulisan jurnal, total durasi jam kerja, dan jumlah jurnal yang menunggu verifikasi.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 self-start sm:self-auto">
              Total {rekapList.length} Siswa Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Tempat PKL</th>
                  <th className="py-3 px-4">Pembimbing</th>
                  <th className="py-3 px-4 text-center">Jumlah Jurnal</th>
                  <th className="py-3 px-4 text-center">Total Jam</th>
                  <th className="py-3 px-4 text-center">Menunggu Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekapList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.nama}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                      {item.kelas}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.tempat_pkl}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.pembimbing}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {item.totalJurnal}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600">
                      {item.totalJam} Jam
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.menunggu > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          {item.menunggu} Menunggu
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. BAGIAN DAFTAR JURNAL & FILTER */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Daftar Jurnal PKL
              </h2>
              <p className="text-xs text-slate-500">
                Pilih status atau nama siswa untuk menyaring jurnal, lalu beri persetujuan atau catatan revisi.
              </p>
            </div>

            {/* Saringan / Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Siswa */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="filter-siswa" className="text-xs font-medium text-slate-600">
                  Siswa:
                </label>
                <select
                  id="filter-siswa"
                  value={filterSiswa}
                  onChange={(e) => setFilterSiswa(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="semua">Semua Siswa ({siswaList.length})</option>
                  {siswaList.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.nama} ({s.kelas})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Status */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="filter-status" className="text-xs font-medium text-slate-600">
                  Status:
                </label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="semua">Semua Status</option>
                  <option value="diajukan">Diajukan (Menunggu)</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="revisi">Perlu Revisi</option>
                </select>
              </div>
            </div>
          </div>

          {/* List Card Jurnal */}
          {filteredJurnal.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 text-sm">
              Tidak ada jurnal yang sesuai dengan kriteria penyaringan yang dipilih.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredJurnal.map((jurnal) => (
                <div
                  key={jurnal.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4 hover:border-slate-300 transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {jurnal.siswa?.nama || "Siswa #" + jurnal.siswa_id}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                          {jurnal.siswa?.kelas}
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-500">
                          {new Date(jurnal.tanggal).toLocaleDateString("id-ID", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          Kompetensi: {jurnal.kompetensi}
                        </span>
                        <span className="font-semibold text-slate-700">
                          Durasi: {jurnal.durasi_jam} Jam
                        </span>
                      </div>
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center gap-2">
                      {jurnal.status === "disetujui" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Disetujui
                        </span>
                      )}

                      {jurnal.status === "diajukan" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Menunggu Verifikasi
                        </span>
                      )}

                      {jurnal.status === "revisi" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Perlu Revisi
                        </span>
                      )}

                      {/* Tombol Aksi Verifikasi */}
                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                        {jurnal.status !== "disetujui" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSetujui(jurnal.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition shadow-sm disabled:opacity-50"
                          >
                            Setujui
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleOpenRevisiModal(jurnal)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition border border-slate-300 disabled:opacity-50"
                        >
                          {jurnal.status === "revisi" ? "Ubah Catatan" : "Revisi"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Isi Kegiatan */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {jurnal.kegiatan}
                  </div>

                  {/* Catatan Revisi Aktif */}
                  {jurnal.status === "revisi" && jurnal.catatan && (
                    <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-3 text-xs text-red-900 flex items-start gap-2">
                      <span className="font-bold text-red-600">Catatan Revisi Saat Ini:</span>
                      <span className="italic">&quot;{jurnal.catatan}&quot;</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal Dialog Input Catatan Revisi */}
      {activeModalId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Minta Revisi Jurnal
              </h3>
              <p className="text-xs text-slate-500">
                Berikan catatan yang jelas agar siswa memahami apa yang perlu diperbaiki pada jurnal ini.
              </p>
            </div>

            {catatanError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                {catatanError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="catatan-revisi" className="block text-xs font-semibold text-slate-700">
                Catatan Revisi dari Pembimbing <span className="text-red-500">*</span>
              </label>
              <textarea
                id="catatan-revisi"
                rows={4}
                value={catatanText}
                onChange={(e) => {
                  setCatatanText(e.target.value);
                  if (catatanError) setCatatanError(null);
                }}
                placeholder="Contoh: Tolong jelaskan alat atau library apa yang Anda gunakan untuk modul ini secara rinci..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
              />
              <p className="text-[11px] text-slate-400">
                *Wajib minimal 5 karakter (saat ini: {catatanText.trim().length} karakter).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveModalId(null);
                  setCatatanText("");
                  setCatatanError(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending || catatanText.trim().length < 5}
                onClick={handleKirimRevisi}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-md shadow-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Mengirim..." : "Kirim Catatan Revisi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
