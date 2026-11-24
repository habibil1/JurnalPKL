"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { tambahJurnalAction } from "@/app/actions/jurnal";

export default function TambahJurnalPage() {
  const [state, formAction, isPending] = useActionState(tambahJurnalAction, null);

  // Ambil tanggal hari ini dan 7 hari ke belakang untuk atribut min & max input
  const today = new Date().toISOString().split("T")[0];
  const past = new Date();
  past.setDate(past.getDate() - 7);
  const minDate = past.toISOString().split("T")[0];

  const [kegiatanText, setKegiatanText] = useState(state?.fields?.kegiatan || "");
  const [kompetensiText, setKompetensiText] = useState(state?.fields?.kompetensi || "");

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
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            Formulir Baru
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Tulis Jurnal Harian PKL
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Catat kegiatan yang Anda laksanakan hari ini. Pastikan informasi terisi dengan jelas dan akurat.
            </p>
          </div>

          {state?.message && !state.success && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
              <span className="text-amber-600 font-bold text-base">&bull;</span>
              <div className="flex-1 font-medium">{state.message}</div>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            {/* Kolom Tanggal */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="tanggal" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Tanggal Kegiatan <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Maksimal 7 hari ke belakang
                </span>
              </div>
              <input
                id="tanggal"
                name="tanggal"
                type="date"
                required
                min={minDate}
                max={today}
                defaultValue={state?.fields?.tanggal || today}
                className={`w-full px-4 py-2.5 rounded-xl border text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${
                  state?.errors?.tanggal ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {state?.errors?.tanggal && (
                <p className="text-xs text-red-600 font-medium">{state.errors.tanggal}</p>
              )}
            </div>

            {/* Kolom Kompetensi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="kompetensi" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Kompetensi / Keahlian <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  3–60 karakter ({kompetensiText.length}/60)
                </span>
              </div>
              <input
                id="kompetensi"
                name="kompetensi"
                type="text"
                required
                maxLength={60}
                placeholder="Contoh: Perancangan Basis Data Relasional"
                value={kompetensiText}
                onChange={(e) => setKompetensiText(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${
                  state?.errors?.kompetensi ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {state?.errors?.kompetensi && (
                <p className="text-xs text-red-600 font-medium">{state.errors.kompetensi}</p>
              )}
            </div>

            {/* Kolom Durasi Jam */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="durasi_jam" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Durasi Kegiatan (Jam) <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  1–10 jam (bilangan bulat)
                </span>
              </div>
              <input
                id="durasi_jam"
                name="durasi_jam"
                type="number"
                required
                min={1}
                max={10}
                step={1}
                defaultValue={state?.fields?.durasi_jam || 8}
                className={`w-full px-4 py-2.5 rounded-xl border text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${
                  state?.errors?.durasi_jam ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {state?.errors?.durasi_jam && (
                <p className="text-xs text-red-600 font-medium">{state.errors.durasi_jam}</p>
              )}
            </div>

            {/* Kolom Deskripsi Kegiatan */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="kegiatan" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Rincian Kegiatan <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${kegiatanText.length < 30 ? "text-amber-600 font-semibold" : "text-slate-400"}`}>
                  {kegiatanText.length}/500 huruf (min. 30 huruf)
                </span>
              </div>
              <textarea
                id="kegiatan"
                name="kegiatan"
                required
                rows={5}
                maxLength={500}
                placeholder="Tuliskan apa saja yang Anda kerjakan hari ini, kendala yang dihadapi, dan hasil pekerjaan..."
                value={kegiatanText}
                onChange={(e) => setKegiatanText(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-slate-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${
                  state?.errors?.kegiatan ? "border-red-400 bg-red-50/20" : "border-slate-300"
                }`}
              />
              {state?.errors?.kegiatan && (
                <p className="text-xs text-red-600 font-medium">{state.errors.kegiatan}</p>
              )}
            </div>

            {/* Tombol Simpan */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Link
                href="/jurnal"
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium shadow-md shadow-blue-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Menyimpan Jurnal...
                  </>
                ) : (
                  "Ajukan Jurnal"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        Jurnal yang telah disetujui guru pembimbing akan otomatis terkunci.
      </footer>
    </div>
  );
}
