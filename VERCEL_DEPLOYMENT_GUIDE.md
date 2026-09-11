# Panduan Lengkap Deploy Logbook ke Vercel & Supabase (Google Auth)

Aplikasi ini dirancang khusus agar **100% siap langsung di-deploy ke Vercel**.

---

## Langkah 1: Push Proyek ke GitHub
Buka terminal di folder `web logbook` dan jalankan:
```bash
git init
git add .
git commit -m "feat: initial commit web logbook fleksibel"
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/web-logbook.git
git push -u origin main
```

---

## Langkah 2: Buat Proyek di Supabase (Gratis)
1. Buka [https://supabase.com](https://supabase.com) lalu Login / Daftar.
2. Klik **"New Project"**, beri nama (misal: `logbook-app`), pilih password database dan region terdekat (`Singapore`).
3. Setelah database siap (sekitar 1-2 menit):
   - Masuk ke menu **SQL Editor** di sidebar kiri Supabase.
   - Buka file [supabase_schema.sql](file:///d:/Naufal/AI/web%20logbook/supabase_schema.sql) di proyek ini, copy seluruh isinya, paste ke SQL Editor Supabase, lalu klik **Run**.
   - Ini akan otomatis membuat tabel profil, tabel logbook, aturan keamanan RLS, dan storage bucket untuk foto kegiatan.

---

## Langkah 3: Aktifkan Login Google di Supabase
1. Di Supabase Dashboard, masuk ke **Authentication** -> **Providers** -> pilih **Google**.
2. Aktifkan toggle **"Enable Google"**.
3. Di sana Anda akan melihat **Callback URL (for OAuth)**, misalnya:
   `https://xyzcompany.supabase.co/auth/v1/callback` (Salin URL ini).
4. Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Buat Project baru atau pilih yang sudah ada.
   - Masuk ke **OAuth consent screen**, isi nama aplikasi (misal: Logbook Pro), pilih User Type *External*.
   - Masuk ke **Credentials** -> **Create Credentials** -> **OAuth Client ID**.
   - Application type: **Web application**.
   - Di bagian **Authorized redirect URIs**, tempel Callback URL yang Anda salin dari Supabase tadi.
   - Klik **Create**, Anda akan mendapatkan **Client ID** dan **Client Secret**.
5. Kembali ke Supabase, masukkan **Client ID** dan **Client Secret** tersebut, lalu klik **Save**.

---

## Langkah 4: Deploy ke Vercel (1-Klik)
1. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **"Add New..."** -> **"Project"**.
3. Pilih repository `web-logbook` yang telah Anda push ke GitHub tadi.
4. Di bagian **Environment Variables**, tambahkan 2 variabel berikut:
   - `NEXT_PUBLIC_SUPABASE_URL`: (Dapat dari Supabase -> Project Settings -> API -> Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Dapat dari Supabase -> Project Settings -> API -> `anon` `public` key)
5. Klik **"Deploy"**!
6. Dalam waktu kurang dari 2 menit, web Anda sudah live di internet dengan domain gratis (contoh: `https://web-logbook.vercel.app`).

---

## Fitur Utama yang Tersedia:
- **Fleksibel**: Switch instan antara mode Magang, KKN, PKL, Skripsi, atau Mandiri.
- **Kalkulasi Jam Otomatis**: Cukup masukkan jam mulai dan jam selesai, total jam terhitung otomatis.
- **Upload Dokumentasi**: Simpan bukti foto kegiatan.
- **Rekap & Cetak Laporan Resmi**: Format A4 rapi siap tanda tangan pembimbing & mahasiswa.
- **Export ke Excel (CSV)**: Unduh data dalam 1 klik untuk dibuka di spreadsheet.
- **Mode Demo Offline / Supabase Sync**: Aplikasi langsung bisa dicoba di localhost bahkan sebelum Supabase dikonfigurasi.
