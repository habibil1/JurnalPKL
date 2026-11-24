import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jurnal PKL - Aplikasi Jurnal Harian Praktik Kerja Lapangan",
  description: "Aplikasi pencatatan jurnal harian siswa Praktik Kerja Lapangan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
