-- ==========================================================
-- SKEMA DATABASE LOGBOOK (SUPABASE POSTGRESQL)
-- Siap dijalankan di Supabase SQL Editor
-- ==========================================================

-- 1. Buat Tabel Profil Pengguna (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  nim TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  program_type TEXT NOT NULL DEFAULT 'magang', -- 'magang', 'kkn', 'pkl', 'skripsi', 'mandiri'
  program_title TEXT DEFAULT '',
  institution TEXT DEFAULT '',
  partner_name TEXT DEFAULT '',
  supervisor_name TEXT DEFAULT '',
  supervisor_contact TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  target_hours NUMERIC DEFAULT 900,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat Tabel Entri Logbook (Log Entries)
CREATE TABLE IF NOT EXISTS public.log_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_type TEXT NOT NULL DEFAULT 'magang',
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours NUMERIC(4, 2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  achievements TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'approved'
  image_url TEXT DEFAULT '',
  supervisor_feedback TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_entries ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan Keamanan RLS
-- Kebijakan Profil:
CREATE POLICY "User can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id OR (auth.jwt() ->> 'email' = 'naufalfaster@gmail.com'));

CREATE POLICY "User can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id OR (auth.jwt() ->> 'email' = 'naufalfaster@gmail.com'));

CREATE POLICY "User can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id OR (auth.jwt() ->> 'email' = 'naufalfaster@gmail.com'));

-- Kebijakan Log Entries:
-- Pengguna biasa hanya akses miliknya sendiri, namun naufalfaster@gmail.com (Super Admin) memiliki FULL ACCESS
CREATE POLICY "User and Admin can view entries" 
  ON public.log_entries FOR SELECT 
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'email' = 'naufalfaster@gmail.com'));

CREATE POLICY "User and Admin can insert entries" 
  ON public.log_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR (auth.jwt() ->> 'email' = 'naufalfaster@gmail.com'));

CREATE POLICY "User and Admin can update entries" 
  ON public.log_entries FOR UPDATE 
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'email' = 'naufalfaster@gmail.com'));

CREATE POLICY "User and Admin can delete entries" 
  ON public.log_entries FOR DELETE 
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'email' = 'naufalfaster@gmail.com'));

-- 5. Trigger Otomatis: Buat Profile baru saat User mendaftar via Google Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, program_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Pengguna Logbook'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    'magang'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Storage Bucket untuk Bukti Foto / Dokumentasi Kegiatan
-- (Jalankan ini untuk membuat bucket 'logbook-docs' berakses publik)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logbook-docs', 'logbook-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan upload foto hanya oleh user terautentikasi
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'logbook-docs');

CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'logbook-docs');

-- 7. Tabel Program Kustom (Dibuat oleh Super User)
CREATE TABLE IF NOT EXISTS public.custom_programs (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  badge_color TEXT DEFAULT 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  supervisor_label TEXT DEFAULT 'Pembimbing / Mentor',
  partner_label TEXT DEFAULT 'Instansi / Mitra',
  default_categories JSONB DEFAULT '["Aktivitas Utama", "Diskusi", "Laporan"]'::jsonb,
  suggested_target_hours NUMERIC DEFAULT 300,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.custom_programs ENABLE ROW LEVEL SECURITY;

-- Siapa saja bisa melihat daftar program kustom
CREATE POLICY "Anyone can view custom programs"
  ON public.custom_programs FOR SELECT
  USING (true);

-- Hanya Super Admin yang bisa menambah, mengedit, atau menghapus program kustom
CREATE POLICY "Super Admin can insert custom programs"
  ON public.custom_programs FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'naufalfaster@gmail.com');

CREATE POLICY "Super Admin can update custom programs"
  ON public.custom_programs FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'naufalfaster@gmail.com');

CREATE POLICY "Super Admin can delete custom programs"
  ON public.custom_programs FOR DELETE
  USING (auth.jwt() ->> 'email' = 'naufalfaster@gmail.com');

