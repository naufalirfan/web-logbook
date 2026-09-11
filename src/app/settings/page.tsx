'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLogbook } from '@/context/LogbookContext';
import { PROGRAM_CONFIGS, ProgramType } from '@/types/logbook';
import { 
  ArrowLeft, 
  Save, 
  Settings as SettingsIcon, 
  Layers, 
  User, 
  Building2, 
  Calendar, 
  Clock, 
  Cloud, 
  Key, 
  CheckCircle2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function SettingsPage() {
  const { profile, updateProfile, activeProgram, switchProgram, isCloudConnected, programConfig } = useLogbook();

  const [formData, setFormData] = useState(profile);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProgramSelect = (type: ProgramType) => {
    switchProgram(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>

      <div className="space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-500" />
            <span>Pengaturan Program & Profil Logbook</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sesuaikan identitas, jenis program kegiatan, dan target jam logbook Anda.
          </p>
        </div>

        {/* 1. Pemilihan Jenis Program */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Pilih Jenis Program Aktif</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Struktur form, kategori aktivitas, dan label pembimbing akan otomatis menyesuaikan dengan program yang Anda pilih.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.keys(PROGRAM_CONFIGS) as ProgramType[]).map((key) => {
              const item = PROGRAM_CONFIGS[key];
              const isSelected = activeProgram === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => handleProgramSelect(key)}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.label}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    <Clock className="w-3 h-3" />
                    <span>Target: {item.suggestedTargetHours} Jam</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Form Detail Identitas & Mitra */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-blue-500" />
            <span>Informasi Identitas & Instansi</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIM / Nomor Induk Mahasiswa / Siswa
              </label>
              <input
                type="text"
                value={formData.nim}
                onChange={(e) => handleChange('nim', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Universitas / Sekolah
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => handleChange('institution', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Program Kegiatan
              </label>
              <input
                type="text"
                value={formData.programTitle}
                onChange={(e) => handleChange('programTitle', e.target.value)}
                placeholder="Contoh: Magang Front-End Engineer di PT GoTo"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pt-3 pb-3">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>Informasi Mitra & Pembimbing Lapangan</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {programConfig.partnerLabel}
              </label>
              <input
                type="text"
                value={formData.partnerName}
                onChange={(e) => handleChange('partnerName', e.target.value)}
                placeholder="Contoh: Desa Sukamaju / PT Maju Bersama"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {programConfig.supervisorLabel}
              </label>
              <input
                type="text"
                value={formData.supervisorName}
                onChange={(e) => handleChange('supervisorName', e.target.value)}
                placeholder="Nama Pembimbing / Mentor"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kontak / Email Pembimbing
              </label>
              <input
                type="text"
                value={formData.supervisorContact || ''}
                onChange={(e) => handleChange('supervisorContact', e.target.value)}
                placeholder="mentor@perusahaan.com / WhatsApp"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Jam Kegiatan
              </label>
              <input
                type="number"
                value={formData.targetHours}
                onChange={(e) => handleChange('targetHours', Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Mulai Program
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Berakhir Program
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {isSaved ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pengaturan berhasil disimpan!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>

        {/* 3. Status Koneksi Supabase & Panduan Vercel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-500" />
              <span>Status Integrasi Backend & Database</span>
            </h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              isCloudConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' 
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
            }`}>
              {isCloudConnected ? 'Supabase Terhubung' : 'Local Storage Demo Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Saat ini aplikasi menyimpan data langsung di browser Anda secara instan. Untuk mengaktifkan sinkronisasi cloud multi-perangkat dan login Google asli saat di-deploy ke Vercel, cukup tambahkan 2 environment variable di dashboard Vercel Anda:
          </p>

          <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-1 overflow-x-auto">
            <p className="text-slate-400"># Masukkan di Vercel: Project Settings -&gt; Environment Variables</p>
            <p><span className="text-cyan-400">NEXT_PUBLIC_SUPABASE_URL</span>=https://your-project.supabase.co</p>
            <p><span className="text-cyan-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Skema SQL siap pakai tersedia di file <code className="text-blue-500 font-semibold">supabase_schema.sql</code></span>
          </div>
        </div>

      </div>
    </div>
  );
}
