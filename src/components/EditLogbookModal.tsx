'use client';

import React, { useState, useEffect } from 'react';
import { LogEntry, EntryStatus } from '@/types/logbook';
import { useLogbook } from '@/context/LogbookContext';
import IndonesianDatePicker from '@/components/IndonesianDatePicker';
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  FileText, 
  Award, 
  Image as ImageIcon, 
  UploadCloud, 
  Trash2,
  Crown,
  CheckCircle2
} from 'lucide-react';

interface EditLogbookModalProps {
  isOpen: boolean;
  entry: LogEntry | null;
  onClose: () => void;
}

export default function EditLogbookModal({ isOpen, entry, onClose }: EditLogbookModalProps) {
  const { updateEntry, programConfig, isAdmin } = useLogbook();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('17:00');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [achievements, setAchievements] = useState('');
  const [status, setStatus] = useState<EntryStatus>('submitted');
  const [imageUrl, setImageUrl] = useState('');
  const [supervisorFeedback, setSupervisorFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync form when entry changes
  useEffect(() => {
    if (entry) {
      setDate(entry.date || '');
      setStartTime(entry.startTime || '08:30');
      setEndTime(entry.endTime || '17:00');
      
      const isKnown = programConfig.defaultCategories.includes(entry.category);
      if (isKnown) {
        setCategory(entry.category);
        setCustomCategory('');
      } else {
        setCategory('__custom__');
        setCustomCategory(entry.category);
      }

      setTitle(entry.title || '');
      setDescription(entry.description || '');
      setAchievements(entry.achievements || '');
      setStatus(entry.status || 'submitted');
      setImageUrl(entry.imageUrl || '');
      setSupervisorFeedback(entry.supervisorFeedback || '');
    }
  }, [entry, programConfig]);

  if (!isOpen || !entry) return null;

  // Calculate duration in hours
  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    return Number((totalMinutes / 60).toFixed(1));
  };

  const duration = calculateDuration(startTime, endTime);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

    setIsSaving(true);
    try {
      const finalCategory = category === '__custom__' ? customCategory.trim() : category;

      await updateEntry(entry.id, {
        date,
        startTime,
        endTime,
        durationHours: duration,
        category: finalCategory || 'Umum',
        title: title.trim(),
        description: description.trim(),
        achievements: achievements.trim(),
        status,
        imageUrl: imageUrl || undefined,
        supervisorFeedback: supervisorFeedback.trim() || undefined,
      });

      onClose();
    } catch (err) {
      console.error('Gagal mengupdate logbook:', err);
      alert('Gagal menyimpan perubahan. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              ✏️
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Catatan Logbook
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ubah informasi rincian kegiatan, waktu, atau lampiran foto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Tanggal & Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Tanggal Kegiatan</span>
              </label>
              <IndonesianDatePicker
                value={date}
                onChange={setDate}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Waktu & Durasi</span>
                </span>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                  {duration} Jam
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Kategori Kegiatan */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Kategori Kegiatan
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {programConfig.defaultCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__custom__">+ Kategori Kustom Lainnya...</option>
            </select>
            {category === '__custom__' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Tulis nama kategori kegiatan Anda..."
                className="mt-2 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}
          </div>

          {/* Judul Kegiatan */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Judul / Topik Kegiatan</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Mengembangkan fitur autentikasi & database"
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Deskripsi Kegiatan */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Deskripsi Detail Kegiatan
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan aktivitas yang Anda kerjakan, kendala yang dihadapi, dan solusinya..."
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              required
            />
          </div>

          {/* Capaian / Luaran */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Capaian / Luaran (Output Hasil)</span>
            </label>
            <input
              type="text"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="Contoh: Modul login selesai 100%, dokumentasi API dipublikasi"
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Verifikasi */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
              Status Verifikasi Logbook
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  status === 'draft'
                    ? 'border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold ring-2 ring-slate-400/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Draft (Konsep)
              </button>
              <button
                type="button"
                onClick={() => setStatus('submitted')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  status === 'submitted'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Diajukan
              </button>
              <button
                type="button"
                onClick={() => setStatus('approved')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  status === 'approved'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                ✓ Disetujui
              </button>
            </div>
          </div>

          {/* Foto Bukti Kegiatan */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Lampiran Foto Bukti Kegiatan</span>
            </label>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Bukti Foto"
                  className="w-20 h-16 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">Foto Terlampir</p>
                  <label className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    Ganti Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      className="hidden"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Upload Foto Kegiatan Baru
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG, atau WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Admin Feedback (Jika Super Admin) */}
          {isAdmin && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-300/60 dark:border-amber-700/40 space-y-2">
              <label className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Catatan & Feedback Pembimbing (Khusus Admin):</span>
              </label>
              <input
                type="text"
                value={supervisorFeedback}
                onChange={(e) => setSupervisorFeedback(e.target.value)}
                placeholder="Tulis evaluasi pembimbing..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
