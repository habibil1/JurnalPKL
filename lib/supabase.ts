import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Hanya log di server untuk memudahkan debugging developer
  if (process.env.NODE_ENV !== "production") {
    console.warn("Peringatan: Variabel NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local");
  }
}

/**
 * Supabase client server-side menggunakan SERVICE_ROLE_KEY.
 * Mengikuti spesifikasi keamanan: tabel privat dengan RLS tertutup untuk publik (anon/authenticated),
 * sehingga seluruh akses baca, tambah, ubah, hapus dikendalikan sepenuhnya melalui server backend.
 */
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
