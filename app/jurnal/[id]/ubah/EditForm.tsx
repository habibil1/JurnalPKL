"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ubahJurnalAction, JurnalActionResult } from "@/app/actions/jurnal";

interface JurnalData {
  id: number;
  tanggal: string;
  kompetensi: string;
  durasi_jam: number;
  kegiatan: string;
  status: "diajukan" | "disetujui" | "revisi";
  catatan: string | null;
}

export default function EditForm({ jurnal }: { jurnal: JurnalData }) {
  const ubahActionWithId = ubahJurnalAction.bind(null, jurnal.id);
  const [state, formAction, isPending] = useActionState<JurnalActionResult | null, FormData>(
    ubahActionWithId,
    null
  );

  const today = new Date().toISOString().split("T")[0];
  const past = new Date();
  past.setDate(past.getDate() - 7);
  const minDate = past.toISOString().split("T")[0];

  const initialKegiatan = state?.fields?.kegiatan ?? jurnal.kegiatan;
  const initialKompetensi = state?.fields?.kompetensi ?? jurnal.kompetensi;

  const [kegiatanText, setKegiatanText] = useState(initialKegiatan);
  const [kompetensiText, setKompetensiText] = useState(initialKompetensi);

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && !state.success && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <span className="text-amber-600 font-bold text-base">&bull;</span>
          <div className="flex-1 font-medium">{state.message}</div>
        </div>
      )}

      {/* Catatan revisi jika sebelumnya berstatus revisi */}
      {jurnal.status === "revisi" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs sm:text-sm text-red-900 space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-red-800">
            <span>⚠️</span>
            <span>Catatan Revisi dari Pembimbing:</span>
          </div>
          <p className="italic pl-5">
            &quot;{jurnal.catatan || "Perbaiki isi jurnal sesuai arahan pembimbing."}&quot;
          </p>
          <p className="text-[11px] text-red-700 pl-5 pt-1">
            *Setelah Anda menyimpan perubahan, status jurnal akan otomatis kembali menjadi <strong>Diajukan</strong> dan catatan ini akan dibersihkan.
          </p>
        </div>
      )}

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
          defaultValue={state?.fields?.tanggal ?? jurnal.tanggal}
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
          defaultValue={state?.fields?.durasi_jam ?? jurnal.durasi_jam}
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
              Menyimpan Perubahan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </button>
      </div>
    </form>
  );
}
