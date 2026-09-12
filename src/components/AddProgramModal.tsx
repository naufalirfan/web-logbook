'use client';

import React, { useState } from 'react';
import { useLogbook } from '@/context/LogbookContext';
import { ProgramConfig } from '@/types/logbook';
import { 
  X, 
  Plus, 
  Layers, 
  Crown, 
  Sparkles, 
  Clock, 
  Building2, 
  UserCheck, 
  Tag, 
  Palette,
  Check
} from 'lucide-react';

interface AddProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (programId: string) => void;
}

const COLOR_OPTIONS = [
  {
    name: 'Blue (Biru)',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    dotColor: 'bg-blue-500'
  },
  {
    name: 'Emerald (Hijau)',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    dotColor: 'bg-emerald-500'
  },
  {
    name: 'Purple (Ungu)',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    dotColor: 'bg-purple-500'
  },
  {
    name: 'Amber (Oranye/Kuning)',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    dotColor: 'bg-amber-500'
  },
  {
    name: 'Rose (Merah Muda)',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    dotColor: 'bg-rose-500'
  },
  {
    name: 'Cyan (Biru Muda)',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    dotColor: 'bg-cyan-500'
  },
  {
    name: 'Indigo (Indigo)',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    dotColor: 'bg-indigo-500'
  },
  {
    name: 'Teal (Teal)',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    dotColor: 'bg-teal-500'
  }
];

export default function AddProgramModal({ isOpen, onClose, onCreated }: AddProgramModalProps) {
  const { addCustomProgram, switchProgram, isAdmin } = useLogbook();

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [supervisorLabel, setSupervisorLabel] = useState('Pembimbing / Mentor');
  const [partnerLabel, setPartnerLabel] = useState('Instansi / Perusahaan');
  const [suggestedTargetHours, setSuggestedTargetHours] = useState(300);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [categories, setCategories] = useState<string[]>([
    'Aktivitas Lapangan',
    'Riset & Analisis',
    'Rapat & Diskusi',
    'Penyusunan Laporan'
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed]);
      setNewCategoryInput('');
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setCategories(prev => prev.filter(c => c !== catToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    setIsSubmitting(true);
    try {
      const generatedId = label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `program-${Date.now()}`;

      const newConfig: Omit<ProgramConfig, 'id'> & { id: string } = {
        id: generatedId,
        label: label.trim(),
        description: description.trim() || `Pencatatan aktivitas untuk program ${label.trim()}`,
        supervisorLabel: supervisorLabel.trim() || 'Pembimbing / Mentor',
        partnerLabel: partnerLabel.trim() || 'Instansi / Perusahaan',
        suggestedTargetHours: Number(suggestedTargetHours) || 300,
        badgeColor: COLOR_OPTIONS[selectedColorIndex].badgeColor,
        defaultCategories: categories.length > 0 ? categories : ['Aktivitas Utama', 'Diskusi', 'Laporan'],
        isCustom: true
      };

      await addCustomProgram(newConfig);
      switchProgram(generatedId);
      if (onCreated) {
        onCreated(generatedId);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create program:', err);
      alert('Gagal menambahkan program. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Crown className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Tambah Program Baru
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menu khusus Super User untuk membuat jenis program logbook kustom yang fleksibel.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama Program */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Nama Program <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Studi Independen AI, Asisten Laboratorium, Penelitian Riset"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              placeholder="Penjelasan singkat mengenai fokus kegiatan program ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
            />
          </div>

          {/* Sebutan Pembimbing & Instansi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sebutan Pembimbing</span>
              </label>
              <input
                type="text"
                placeholder="misal: Mentor Proyek / DPL"
                value={supervisorLabel}
                onChange={(e) => setSupervisorLabel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Sebutan Tempat / Mitra</span>
              </label>
              <input
                type="text"
                placeholder="misal: Perusahaan / Sekolah"
                value={partnerLabel}
                onChange={(e) => setPartnerLabel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Target Jam & Pilihan Warna */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Target Jam Bawaan</span>
              </label>
              <input
                type="number"
                min={10}
                max={2000}
                value={suggestedTargetHours}
                onChange={(e) => setSuggestedTargetHours(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-500" />
                <span>Warna Tema Badge</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {COLOR_OPTIONS.map((col, idx) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`w-7 h-7 rounded-full ${col.dotColor} flex items-center justify-center transition-transform ${
                      selectedColorIndex === idx ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={col.name}
                  >
                    {selectedColorIndex === idx && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Kategori Kegiatan Default */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-500" />
              <span>Daftar Kategori Kegiatan Awal</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Kategori yang akan menjadi pilihan dropdown saat pengguna mengisi logbook di program ini.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik kategori baru, lalu klik Tambah..."
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                + Tambah
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1 max-h-32 overflow-y-auto">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !label.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan & Aktifkan Program'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
