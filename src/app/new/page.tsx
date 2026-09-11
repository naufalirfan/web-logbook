'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLogbook } from '@/context/LogbookContext';
import { EntryStatus } from '@/types/logbook';
import confetti from 'canvas-confetti';
import UpgradeModal from '@/components/UpgradeModal';
import IndonesianDatePicker from '@/components/IndonesianDatePicker';
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Clock, 
  FileText, 
  Award, 
  Image as ImageIcon, 
  UploadCloud, 
  CheckCircle2,
  Sparkles,
  Zap,
  Crown
} from 'lucide-react';
import Link from 'next/link';

export default function NewEntryPage() {
  const router = useRouter();
  const { addEntry, programConfig, canAddEntry, isPro, maxFreeEntries, isAdmin } = useLogbook();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('17:00');
  const [category, setCategory] = useState(programConfig.defaultCategories[0] || 'Aktivitas Utama');
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [achievements, setAchievements] = useState('');
  const [status, setStatus] = useState<EntryStatus>('submitted');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-set status to 'approved' for Super Admin
  useEffect(() => {
    if (isAdmin) {
      setStatus('approved');
    }
  }, [isAdmin]);

  // Auto calculate duration in hours
  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // if overnight
    return Number((totalMinutes / 60).toFixed(1));
  };

  const duration = calculateDuration(startTime, endTime);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to base64 for instant preview & local persistence
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Mohon lengkapi judul dan deskripsi kegiatan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalCategory = category === '__custom__' ? customCategory.trim() : category;

      await addEntry({
        date,
        startTime,
        endTime,
        durationHours: duration,
        category: finalCategory || 'Umum',
        title: title.trim(),
        description: description.trim(),
        achievements: achievements.trim(),
        status,
        imageUrl: imageUrl || undefined
      });

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan catatan kegiatan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${programConfig.badgeColor}`}>
          Mode: {programConfig.label}
        </span>
      </div>

      {/* Tier Free Limit Reached Alert */}
      {!canAddEntry && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Batas Kuota {maxFreeEntries} Entri Tier FREE Telah Tercapai
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tingkatkan akun ke PRO untuk melanjutkan pencatatan entri tanpa batas!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsUpgradeOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:scale-105 transition-transform"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Upgrade ke PRO</span>
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Catat Logbook Harian</span>
            <Sparkles className="w-5 h-5 text-blue-500" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dokumentasikan aktivitas kerja, riset, atau pengabdian secara terperinci.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Tanggal & Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tanggal Kegiatan</span>
                </label>
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  (Kalender Indonesia)
                </span>
              </div>
              
              <IndonesianDatePicker
                value={date}
                onChange={setDate}
                required
              />

              {/* Tombol Pintas Tanggal */}
              <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDate(today)}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-medium transition-colors border border-blue-200/50 dark:border-blue-900/50 shadow-xs"
                >
                  ⚡ Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    setDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors border border-slate-200/50 dark:border-slate-700/50 shadow-xs"
                >
                  Kemarin
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Jam Mulai</span>
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  (Jam:Menit)
                </span>
              </div>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker?.();
                  } catch {
                    // fallback
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer transition-all hover:border-blue-400 dark:hover:border-blue-500"
                title="Klik untuk memilih jam"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Jam Selesai</span>
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  (Jam:Menit)
                </span>
              </div>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker?.();
                  } catch {
                    // fallback
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer transition-all hover:border-blue-400 dark:hover:border-blue-500"
                title="Klik untuk memilih jam"
              />
            </div>
          </div>

          {/* Info Durasi Terhitung */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs">
            <span className="text-slate-600 dark:text-slate-300">Total Durasi Aktivitas:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{duration} Jam Kegiatan</span>
          </div>

          {/* Row 2: Kategori */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kategori Kegiatan
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
            >
              {programConfig.defaultCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__custom__">+ Kategori Kustom Lainnya...</option>
            </select>

            {category === '__custom__' && (
              <input
                type="text"
                placeholder="Tulis nama kategori baru..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            )}
          </div>

          {/* Row 3: Judul Kegiatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Judul / Nama Aktivitas</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Implementasi modul autentikasi Google OAuth & verifikasi email"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Row 4: Deskripsi Rinci */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Deskripsi Pekerjaan / Aktivitas Rinci
            </label>
            <textarea
              required
              rows={4}
              placeholder="Jelaskan langkah-langkah yang dikerjakan, kendala yang dihadapi, diskusi dengan tim/pembimbing, dsb..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 leading-relaxed"
            />
          </div>

          {/* Row 5: Capaian / Hasil / Output */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Hasil / Luaran / Capaian (Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Fitur berhasil lolos pengujian unit dan merge request disetujui"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Row 6: Upload Foto Dokumentasi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Bukti Foto / Dokumentasi Kegiatan (Opsional)</span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File upload trigger */}
              <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition-colors group">
                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors mb-1.5" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-500">Pilih Foto dari Galeri</span>
                <span className="text-[11px] text-slate-400">PNG, JPG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>

              {/* URL Input */}
              <div className="flex flex-col justify-center">
                <span className="text-[11px] text-slate-400 mb-1">Atau tempel link gambar:</span>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            {/* Preview Image if present */}
            {imageUrl && (
              <div className="mt-3 relative w-36 h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Row 7: Status Simpan */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {isAdmin && (
                <label className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 cursor-pointer shadow-xs transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/40">
                  <input
                    type="radio"
                    name="status"
                    value="approved"
                    checked={status === 'approved'}
                    onChange={() => setStatus('approved')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>👑 Langsung Terverifikasi (Disetujui)</span>
                </label>
              )}

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="submitted"
                  checked={status === 'submitted'}
                  onChange={() => setStatus('submitted')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Ajukan untuk Ditinjau</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Simpan sebagai Draft</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !canAddEntry}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : !canAddEntry ? 'Batas Kuota FREE Tercapai' : 'Simpan Logbook'}</span>
            </button>
          </div>

        </form>

      </div>

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />
    </div>
  );
}
