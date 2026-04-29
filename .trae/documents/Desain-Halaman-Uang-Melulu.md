# Desain Halaman — Uang Melulu (Desktop-first)

## Global Styles
- Canvas: `#0B1220` (gelap) atau `#F8FAFC` (terang). Default: terang.
- Primary: `#16A34A` (Hijau), Danger: `#EF4444`, Warning: `#F59E0B`, Info: `#06B6D4`.
- Typography: Inter/Sans; skala 12/14/16/20/24/32.
- Komponen:
  - Button: Primary (hijau), Secondary (abu), Destructive (merah). Hover: +8% gelap.
  - Input: border halus, fokus ring hijau.
  - Card: radius 12, shadow ringan.
- Format:
  - Uang: `Rp 1.234.567`.
  - Tanggal: `28 Apr 2026`.

## Pola Layout (semua halaman private)
- Struktur desktop: **Sidebar kiri (240px)** + **Topbar** + **Konten** (max-width 1200–1320px).
- Responsive: <1024px sidebar jadi drawer, tabel jadi list/card.
- “Auth middleware”: saat loading sesi tampilkan skeleton full-page; jika tidak login redirect `/auth`.

---

## 1) Halaman Autentikasi (/auth)
**Meta**: Title “Masuk — Uang Melulu”; Desc “Kelola keuangan pribadimu.”
**Layout**: 2 kolom (kiri ilustrasi/benefit, kanan card form). Mobile: 1 kolom.
**Komponen**:
- AuthCard
  - Tab: “Masuk” | “Daftar”
  - Field Masuk: Email, Kata Sandi, checkbox “Ingat saya” (opsional)
  - CTA: Button “Masuk”
  - Link: “Lupa kata sandi?” → mode reset
- Mode Lupa Sandi:
  - Copy: “Masukkan email untuk menerima tautan reset.”
  - Button: “Kirim email reset”
- Error states (inline): “Email tidak valid”, “Kata sandi salah”, “Akun belum terdaftar”.

---

## 2) Dashboard (/dashboard)
**Meta**: Title “Dashboard — Uang Melulu”; OG title sama.
**Struktur**:
- Sidebar: Logo “Uang Melulu”, menu: Dashboard, Transaksi, Laporan, Pengaturan.
- Topbar: breadcrumb “Dashboard”, filter periode (Bulan ini), tombol “Tambah Transaksi”.
- Konten (grid 12 kolom):
  - Row 1 (cards):
    - Card “Total Saldo”
    - Card “Pemasukan Bulan Ini”
    - Card “Pengeluaran Bulan Ini”
    - Card “Selisih”
  - Row 2:
    - ChartCard “Tren 14 hari” (line/area: masuk vs keluar)
    - ListCard “Akun” (nama akun + saldo)
  - Row 3:
    - TablePreview “Transaksi Terbaru” (5–10 baris) + link “Lihat semua”.
**Empty state**:
- “Belum ada transaksi. Mulai dengan menambahkan transaksi pertamamu.” + CTA.

---

## 3) Transaksi (/transaksi)
**Meta**: Title “Transaksi — Uang Melulu”.
**Struktur**:
- Header: judul, tombol “Tambah”, tombol “Transfer”.
- FilterBar:
  - Rentang tanggal, Akun, Kategori, Tipe (Masuk/Keluar/Transfer), Search “Cari catatan…”.
- TransactionTable:
  - Kolom: Tanggal, Tipe, Kategori, Akun, Catatan, Nominal, Aksi.
  - Aksi: “Ubah”, “Hapus”. Konfirmasi: “Hapus transaksi ini?”
- TransactionForm (Modal/Drawer):
  - Field: Tipe, Nominal, Tanggal, Akun, Kategori, Catatan, Lampiran (opsional)
  - CTA: “Simpan” / “Simpan Perubahan”
- TransferForm:
  - Field: Dari Akun, Ke Akun, Nominal, Tanggal, Catatan
  - CTA: “Simpan Transfer”

---

## 4) Laporan (/laporan)
**Meta**: Title “Laporan — Uang Melulu”.
**Struktur**:
- Controls: periode (minggu/bulan/kustom), toggle “Masuk”/“Keluar”.
- SummaryRow: Total, Rata-rata harian.
- Chart:
  - Bar/Pie “Pengeluaran per Kategori” (top 6 + “Lainnya”).
  - Line “Tren periode”.
- InsightCard (copy singkat):
  - “Kategori terbesar bulan ini: {kategori}.”

---

## 5) Pengaturan (/pengaturan)
**Meta**: Title “Pengaturan — Uang Melulu”.
**Struktur**: halaman bertab.
- Tab “Profil”: Nama lengkap, Username, Avatar (upload), tombol “Simpan”.
- Tab “Akun”: tabel akun + CTA “Tambah Akun”, toggle “Aktif”.
- Tab “Kategori”: daftar kategori (ikon+warna), CTA “Tambah Kategori”, dukung subkategori.
- Tab “Keamanan”: tombol “Keluar”. Copy: “Kamu akan keluar dari sesi ini.”
- (Opsional) Tab “Keluarga”: “Buat Grup”, daftar anggota, tombol “Undang”.
