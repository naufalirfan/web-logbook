export type ProgramType = 'magang' | 'kkn' | 'pkl' | 'skripsi' | 'mandiri';

export interface ProgramConfig {
  id: ProgramType;
  label: string;
  badgeColor: string;
  supervisorLabel: string; // e.g. "Mentor Lapangan", "Dosen Pembimbing Lapangan", "Dosen Pembimbing"
  partnerLabel: string; // e.g. "Perusahaan / Instansi", "Desa / Kecamatan", "Laboratorium / Departemen"
  defaultCategories: string[];
  suggestedTargetHours: number;
  description: string;
}

export const PROGRAM_CONFIGS: Record<ProgramType, ProgramConfig> = {
  magang: {
    id: 'magang',
    label: 'Magang RSGM UMY',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    supervisorLabel: 'Pembimbing Klinik / Instruktur Lab RSGM',
    partnerLabel: 'Rumah Sakit Gigi dan Mulut (RSGM) UMY',
    defaultCategories: [
      'Gigi Tiruan Lepasan Akrilik',
      'Crown & Bridge (Gigi Tiruan Cekat)',
      'Waxing & Carving Gigi',
      'Pengecoran Logam (Casting) & Sandblasting',
      'Finishing & Pemolesan Plat Akrilik',
      'Sterilisasi & Manajemen Model Kerja',
      'Bimbingan Kasus & Evaluasi Dosen'
    ],
    suggestedTargetHours: 500,
    description: 'Pencatatan praktik kerja lapangan dan magang laboratorium teknik gigi di RSGM UMY Yogyakarta.'
  },
  kkn: {
    id: 'kkn',
    label: 'KKN / Pengabdian',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    supervisorLabel: 'Dosen Pembimbing Lapangan (DPL)',
    partnerLabel: 'Lokasi Desa / Kelurahan & Kecamatan',
    defaultCategories: [
      'Sosialisasi & Edukasi Warga',
      'Survei & Pemetaan Wilayah',
      'Pelaksanaan Program Kerja',
      'Koordinasi Perangkat Desa',
      'Rapat Divisi Tim',
      'Penyusunan LPJ / Luaran'
    ],
    suggestedTargetHours: 200,
    description: 'Pencatatan program kerja desa, pengabdian masyarakat, dan dokumentasi lapangan.'
  },
  pkl: {
    id: 'pkl',
    label: 'PKL / Praktik Kerja',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    supervisorLabel: 'Pembimbing Lapangan',
    partnerLabel: 'Kantor / Lembaga / Bengkel Mitra',
    defaultCategories: [
      'Praktik Lapangan',
      'Observasi Teknis',
      'Pengolahan Data / Berkas',
      'Bimbingan Teknis',
      'Penyusunan Modul / Laporan'
    ],
    suggestedTargetHours: 350,
    description: 'Pencatatan praktik kerja lapangan untuk siswa SMK maupun mahasiswa vokasi.'
  },
  skripsi: {
    id: 'skripsi',
    label: 'Skripsi / Riset TA',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    supervisorLabel: 'Dosen Pembimbing Utama',
    partnerLabel: 'Departemen / Program Studi / Lab',
    defaultCategories: [
      'Studi Literatur / Jurnal',
      'Bimbingan Dosen',
      'Pengumpulan Data / Eksperimen',
      'Analisis & Pengolahan Data',
      'Penulisan Bab 1-3',
      'Penulisan Bab 4-5',
      'Revisi & Persiapan Sidang'
    ],
    suggestedTargetHours: 250,
    description: 'Log konsultasi skripsi/tugas akhir, progres revisi bab, dan catatan bimbingan.'
  },
  mandiri: {
    id: 'mandiri',
    label: 'Proyek / Belajar Mandiri',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    supervisorLabel: 'Lead / Mentor Belajar',
    partnerLabel: 'Nama Proyek / Organisasi',
    defaultCategories: [
      'Coding & Desain',
      'Sertifikasi & Kursus Online',
      'Review Progres',
      'Eksplorasi Teknologi Baru',
      'Portofolio'
    ],
    suggestedTargetHours: 150,
    description: 'Tracking progres belajar mandiri, proyek open-source, atau portfolio showcase.'
  }
};

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationHours: number;
  category: string;
  title: string;
  description: string;
  achievements?: string;
  status: 'draft' | 'submitted' | 'approved';
  imageUrl?: string;
  supervisorFeedback?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  nim: string;
  avatarUrl?: string;
  programType: ProgramType;
  programTitle: string;
  institution: string; // Universitas / Sekolah
  partnerName: string; // Nama Perusahaan / Desa / Lab
  supervisorName: string;
  supervisorContact?: string;
  startDate: string;
  endDate: string;
  targetHours: number;
  role?: 'admin' | 'user';
  tier: UserTier;
}

export type UserTier = 'free' | 'pro';

export const FREE_TIER_LIMITS = {
  maxEntries: 15,
  hasWatermark: true,
  maxPrograms: 1,
  canExportCSV: true,
  canExportPDF: true,
};

export const PRO_TIER_LIMITS = {
  maxEntries: Infinity,
  hasWatermark: false,
  maxPrograms: 5,
  canExportCSV: true,
  canExportPDF: true,
};

export const ADMIN_EMAILS = ['naufalfaster@gmail.com'];

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}
