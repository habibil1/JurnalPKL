"use client";

import { useActionState } from "react";
import Link from "next/link";
import { masukSiswaAction } from "@/app/actions/auth";

export default function MasukPage() {
  const [state, formAction, isPending] = useActionState(masukSiswaAction, null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
      {/* Header mini */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
        >
          &larr; Kembali ke Beranda
        </Link>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          Portal Siswa
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md shadow-blue-500/25">
              J
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Masuk Jurnal PKL
            </h1>
            <p className="text-sm text-slate-500">
              Masukkan kode siswa rahasia yang telah diberikan oleh pembimbing Anda.
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            {state && !state.success && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start gap-2.5">
                <span className="text-amber-500 font-bold">&bull;</span>
                <span className="flex-1">{state.message}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="kode"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Kode Masuk Siswa
              </label>
              <input
                id="kode"
                name="kode"
                type="text"
                autoComplete="off"
                required
                placeholder="Contoh: PKL-A1N1"
                className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder-slate-400 font-mono text-center tracking-widest text-lg uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition ${
                  state?.errors?.kode ? "border-amber-400 bg-amber-50/20" : "border-slate-300"
                }`}
              />
              {state?.errors?.kode ? (
                <p className="text-xs text-amber-600 mt-1">{state.errors.kode}</p>
              ) : (
                <p className="text-[11px] text-slate-400 text-center">
                  Kode berupa 6–12 karakter rahasia (huruf kapital dan angka).
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Memverifikasi...
                </>
              ) : (
                "Masuk ke Jurnal Saya"
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1">
            <p>Bukan murid PKL?</p>
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:underline inline-block"
            >
              Masuk sebagai Admin / Pembimbing &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        Pastikan tidak membagikan kode rahasia Anda kepada orang lain.
      </footer>
    </div>
  );
}
