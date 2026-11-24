-- ==========================================
-- SKEMA DATABASE APLIKASI JURNAL PKL
-- ==========================================

create table public.siswa (
  id bigint generated always as identity primary key,
  nama text not null check (char_length(trim(nama)) between 3 and 40),
  kelas text not null check (char_length(trim(kelas)) > 0),
  tempat_pkl text not null check (char_length(trim(tempat_pkl)) > 0),
  pembimbing text not null check (char_length(trim(pembimbing)) > 0),
  kode text not null unique check (char_length(trim(kode)) between 6 and 12)
);

create table public.jurnal (
  id bigint generated always as identity primary key,
  siswa_id bigint not null references public.siswa(id) on delete restrict,
  tanggal date not null,
  kegiatan text not null check (char_length(trim(kegiatan)) between 30 and 500),
  kompetensi text not null check (char_length(trim(kompetensi)) between 3 and 60),
  durasi_jam int not null check (durasi_jam between 1 and 10),
  status text not null default 'diajukan' check (status in ('diajukan', 'disetujui', 'revisi')),
  catatan text,
  dibuat timestamptz not null default now(),
  unique (siswa_id, tanggal)
);

-- ==========================================
-- KEAMANAN: REVOKE & ROW LEVEL SECURITY (RLS)
-- ==========================================

revoke all on public.siswa from anon, authenticated;
revoke all on public.jurnal from anon, authenticated;

alter table public.siswa enable row level security;
alter table public.jurnal enable row level security;

-- ==========================================
-- DATA CONTOH FIKTIF (5 SISWA & 12 JURNAL)
-- ==========================================

insert into public.siswa (nama, kelas, tempat_pkl, pembimbing, kode) values
  ('Raka Pratama', 'XII RPL 1', 'PT Nusantara Digital', 'Budi Santoso, S.Kom', 'PKL-A1N1'),
  ('Nadia Putri', 'XII RPL 1', 'CV Kreatif Media', 'Siti Aminah, S.Pd', 'PKL-B2M2'),
  ('Dimas Saputra', 'XII RPL 2', 'PT Telkom Akses Malang', 'Andi Wijaya, S.T', 'PKL-C3K3'),
  ('Aulia Rahma', 'XII RPL 2', 'Studio Kode Malang', 'Dewi Lestari, M.Kom', 'PKL-D4J4'),
  ('Fajar Nugroho', 'XII RPL 1', 'PT Sinergi Data', 'Budi Santoso, S.Kom', 'PKL-E5H5');

insert into public.jurnal (siswa_id, tanggal, kegiatan, kompetensi, durasi_jam, status, catatan) values
  (1, current_date - interval '5 days', 'Melakukan instalasi lingkungan pengembangan Next.js dan konfigurasi repositori Git perusahaan.', 'Setup Environment & Git', 8, 'disetujui', null),
  (1, current_date - interval '4 days', 'Merancang struktur tabel database relasional untuk modul inventaris barang menggunakan PostgreSQL.', 'Perancangan Basis Data', 8, 'disetujui', null),
  (1, current_date - interval '2 days', 'Membuat halaman formulir input data barang masuk beserta validasi input di sisi klien.', 'Pengembangan Frontend', 7, 'revisi', 'Tolong jelaskan library atau teknik validasi yang digunakan secara lebih rinci.'),
  (1, current_date - interval '1 day', 'Mengintegrasikan endpoint API penyimpanan barang masuk dan melakukan uji coba pengiriman data.', 'Integrasi REST API', 8, 'diajukan', null),

  (2, current_date - interval '4 days', 'Membuat wireframe antarmuka dashboard admin menggunakan Figma sesuai kebutuhan tim desain.', 'Desain UI/UX', 6, 'disetujui', null),
  (2, current_date - interval '2 days', 'Mengubah desain kartu statistik menjadi komponen responsif dengan Tailwind CSS.', 'Slicing UI Responsif', 7, 'diajukan', null),

  (3, current_date - interval '5 days', 'Melakukan pengecekan redaman kabel fiber optik menggunakan OTDR di lokasi pelanggan baru.', 'Instalasi Jaringan Fiber', 8, 'disetujui', null),
  (3, current_date - interval '3 days', 'Mendokumentasikan titik koordinat ODP dan jalur distribusi jaringan ke dalam sistem peta internal.', 'Pemetaan Infrastruktur', 6, 'revisi', 'Sertakan jumlah titik ODP yang berhasil didata pada hari tersebut.'),

  (4, current_date - interval '3 days', 'Memperbaiki bug tampilan navigasi mobile yang bertumpuk pada layar berukuran kecil.', 'Debugging CSS & Layout', 7, 'disetujui', null),
  (4, current_date - interval '1 day', 'Menulis unit test sederhana untuk fungsi perhitungan diskon dan pajak pada modul kasir.', 'Pengujian Perangkat Lunak', 8, 'diajukan', null),

  (5, current_date - interval '2 days', 'Membersihkan data duplikat pada file CSV laporan bulanan sebelum diimpor ke database.', 'Pengolahan Data', 7, 'disetujui', null),
  (5, current_date, 'Membuat kueri rekapitulasi transaksi mingguan untuk kebutuhan laporan evaluasi tim.', 'Query & Analisis SQL', 6, 'diajukan', null);