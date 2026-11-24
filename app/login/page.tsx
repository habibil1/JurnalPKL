"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAdminAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, null);
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
          Portal Guru / Admin
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md shadow-slate-900/20">
              A
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Login Admin / Guru
            </h1>
            <p className="text-sm text-slate-500">
              Masuk untuk merekap data siswa, memverifikasi, dan merevisi jurnal harian.
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            {state && !state.success && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
                <span className="text-red-500 font-bold">&bull;</span>
                <span className="flex-1">{state.message}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Kata Sandi Admin
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Masukkan kata sandi..."
                  className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition pr-12 ${
                    state?.errors?.password ? "border-red-400 bg-red-50/20" : "border-slate-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800 px-1 py-1"
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
              {state?.errors?.password && (
                <p className="text-xs text-red-600 mt-1">{state.errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-medium shadow-md shadow-slate-900/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Memverifikasi...
                </>
              ) : (
                "Masuk ke Portal Admin"
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1">
            <p>Siswa PKL?</p>
            <Link
              href="/masuk"
              className="font-medium text-blue-600 hover:underline inline-block"
            >
              Masuk dengan Kode Siswa &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        Akses khusus guru pembimbing dan administrator PKL.
      </footer>
    </div>
  );
}
