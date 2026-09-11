'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLogbook } from '@/context/LogbookContext';
import { LogEntry } from '@/types/logbook';
import ImageModal from '@/components/ImageModal';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Trash2, 
  Plus, 
  Image as ImageIcon,
  MessageSquare,
  Award,
  ArrowUpDown,
  Crown,
  CheckCheck,
  Send
} from 'lucide-react';

export default function LogbookTable() {
  const { entries, deleteEntry, updateEntry, reviewEntry, programConfig, isAdmin } = useLogbook();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Feedback input state per entry
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);

  // Image Lightbox State
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Available categories based on current entries + config defaults
  const categories = useMemo(() => {
    const set = new Set<string>(programConfig.defaultCategories);
    entries.forEach(e => set.add(e.category));
    return Array.from(set);
  }, [entries, programConfig]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => {
        const matchesSearch = 
          entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (entry.achievements && entry.achievements.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || entry.status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime || '00:00'}`).getTime();
        const dateB = new Date(`${b.date}T${b.startTime || '00:00'}`).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [entries, searchQuery, selectedCategory, selectedStatus, sortOrder]);

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Yakin ingin menghapus entri kegiatan "${title}"?`)) {
      deleteEntry(id);
    }
  };

  const handleStatusChange = (id: string, status: LogEntry['status']) => {
    updateEntry(id, { status });
  };

  // Admin Approve All Submitted
  const handleApproveAllSubmitted = () => {
    const submittedEntries = entries.filter(e => e.status === 'submitted');
    if (submittedEntries.length === 0) {
      alert('Tidak ada entri dengan status "Diajukan" untuk disetujui.');
      return;
    }
    if (window.confirm(`Setujui sekaligus ${submittedEntries.length} entri kegiatan yang diajukan?`)) {
      submittedEntries.forEach(e => {
        reviewEntry(e.id, 'approved', e.supervisorFeedback || 'Disetujui oleh Admin.');
      });
    }
  };

  const handleSaveFeedback = (id: string) => {
    const text = feedbackInputs[id];
    reviewEntry(id, 'approved', text);
    setEditingFeedbackId(null);
  };

  return (
    <div className="space-y-4">

      {/* Special Admin Verifier Bar */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/10 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-amber-900 dark:text-amber-300">
                  Panel Verifikator Super Admin
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  naufalfaster@gmail.com
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Anda memiliki akses penuh untuk meninjau, menyetujui, dan memberikan evaluasi resmi pembimbing pada semua aktivitas.
              </p>
            </div>
          </div>

          <button
            onClick={handleApproveAllSubmitted}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Setujui Semua yang Diajukan</span>
          </button>
        </div>
      )}
      
      {/* Controls Bar: Search, Category, Status, Sort */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aktivitas, capaian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none pl-8 pr-8 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="flex-1 sm:flex-initial">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full appearance-none px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="approved">Disetujui</option>
              <option value="submitted">Diajukan</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Urutkan Tanggal"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
          </button>

          {/* New Entry Button */}
          <Link
            href="/new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Entri</span>
          </Link>
        </div>

      </div>

      {/* Entries List Cards */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Belum Ada Catatan Kegiatan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Tidak ada log kegiatan yang cocok dengan filter pencarian.'
              : `Mulai isi logbook harian untuk program ${programConfig.label}.`}
          </p>
          <Link
            href="/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Entri Pertama</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                {/* Main Content Info */}
                <div className="flex-1 space-y-3">
                  
                  {/* Meta Pills: Date, Time, Duration, Category */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>{new Date(entry.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </span>

                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{entry.startTime} - {entry.endTime}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 ml-1">({entry.durationHours} Jam)</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                      {entry.category}
                    </span>

                    {/* Status Dropdown/Pill */}
                    <div className="relative">
                      <select
                        value={entry.status}
                        onChange={(e) => handleStatusChange(entry.id, e.target.value as LogEntry['status'])}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border appearance-none cursor-pointer pr-6 ${
                          entry.status === 'approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : entry.status === 'submitted'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="submitted">Diajukan</option>
                        <option value="approved">Disetujui</option>
                      </select>
                      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-60">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {entry.title}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {entry.description}
                  </p>

                  {/* Achievements / Output */}
                  {entry.achievements && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                      <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">Capaian / Luaran: </span>
                        <span>{entry.achievements}</span>
                      </div>
                    </div>
                  )}

                  {/* Supervisor Feedback (if any) */}
                  {entry.supervisorFeedback && editingFeedbackId !== entry.id && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200">
                      <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold">Catatan Pembimbing / Evaluasi: </span>
                        <span>{entry.supervisorFeedback}</span>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setEditingFeedbackId(entry.id);
                            setFeedbackInputs(prev => ({ ...prev, [entry.id]: entry.supervisorFeedback || '' }));
                          }}
                          className="text-[10px] text-blue-600 underline font-semibold hover:opacity-80 ml-2"
                        >
                          Ubah
                        </button>
                      )}
                    </div>
                  )}

                  {/* Admin Feedback Inline Input */}
                  {isAdmin && (editingFeedbackId === entry.id || !entry.supervisorFeedback) && (
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-300/60 dark:border-amber-700/40 space-y-2">
                      <label className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <Crown className="w-3 h-3 text-amber-500" />
                        <span>Beri Catatan & Feedback Pembimbing (Admin):</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Tulis evaluasi, catatan perbaikan, atau apresiasi..."
                          value={feedbackInputs[entry.id] ?? (entry.supervisorFeedback || '')}
                          onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [entry.id]: e.target.value }))}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                        <button
                          onClick={() => handleSaveFeedback(entry.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm transition-all"
                        >
                          <Send className="w-3 h-3" />
                          <span>Simpan & Setujui</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column: Photo Attachment & Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  
                  {/* Photo Thumbnail */}
                  {entry.imageUrl ? (
                    <button
                      onClick={() => setPreviewImage({ url: entry.imageUrl!, title: entry.title })}
                      className="relative w-24 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group/thumb shadow-sm hover:ring-2 hover:ring-blue-500 transition-all shrink-0"
                      title="Klik untuk melihat bukti foto kegiatan"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.imageUrl}
                        alt="Bukti Kegiatan"
                        className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    </button>
                  ) : null}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {isAdmin && entry.status !== 'approved' && (
                      <button
                        onClick={() => reviewEntry(entry.id, 'approved', entry.supervisorFeedback || 'Disetujui oleh Super Admin.')}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl hover:bg-emerald-200 transition-colors"
                        title="Setujui Entri Ini Langsung"
                      >
                        ✓ Setujui
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(entry.id, entry.title)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {previewImage && (
        <ImageModal
          isOpen={Boolean(previewImage)}
          imageUrl={previewImage.url}
          title={previewImage.title}
          onClose={() => setPreviewImage(null)}
        />
      )}

    </div>
  );
}
