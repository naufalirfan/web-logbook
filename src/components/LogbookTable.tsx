'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLogbook } from '@/context/LogbookContext';
import { LogEntry } from '@/types/logbook';
import ImageModal from '@/components/ImageModal';
import EditLogbookModal from '@/components/EditLogbookModal';
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
  Send,
  Pencil,
  RotateCcw,
  Cloud,
  RefreshCw
} from 'lucide-react';

export default function LogbookTable() {
  const { entries, deleteEntry, updateEntry, reviewEntry, restoreDefaultEntries, syncWithCloud, programConfig, isAdmin } = useLogbook();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Feedback input state per entry
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);

  // Image Lightbox State
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Edit Logbook Entry Modal State
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);

  // Available categories based on current entries + config defaults
  const categories = useMemo(() => {
    const set = new Set<string>(programConfig?.defaultCategories || []);
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

  // Helper for Notion pastel category tags
  const getCategoryBadgeClass = (category: string) => {
    const c = (category || '').toLowerCase();
    if (c.includes('klinis') || c.includes('pasien') || c.includes('kerja') || c.includes('inti')) {
      return 'notion-badge-mint';
    } else if (c.includes('bimbingan') || c.includes('evaluasi') || c.includes('diskusi') || c.includes('teori')) {
      return 'notion-badge-lavender';
    } else if (c.includes('mandiri') || c.includes('praktik') || c.includes('riset') || c.includes('analisis')) {
      return 'notion-badge-sky';
    } else if (c.includes('sosialisasi') || c.includes('kunjungan') || c.includes('rapat')) {
      return 'notion-badge-peach';
    } else if (c.includes('laporan') || c.includes('administrasi') || c.includes('dokumentasi')) {
      return 'notion-badge-yellow';
    }
    return 'notion-badge-gray';
  };

  return (
    <div className="space-y-3.5">

      {/* Special Admin Verifier Bar (Notion Callout style) */}
      {isAdmin && (
        <div className="border border-[#ffe8d4] dark:border-[#d95b00]/30 bg-[#fef7d6]/40 dark:bg-[#d95b00]/10 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#d95b00] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#793400] dark:text-[#fb923c]">
                  Panel Verifikator Super Admin
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#ffe8d4] text-[#d95b00] dark:bg-[#d95b00]/25 dark:text-[#fb923c]">
                  naufalfaster@gmail.com
                </span>
              </div>
              <p className="text-xs text-[#5d5b54] dark:text-[#9b9a97] mt-0.5">
                Akses verifikator penuh untuk menyetujui logbook dan mencantumkan feedback resmi pembimbing.
              </p>
            </div>
          </div>

          <button
            onClick={handleApproveAllSubmitted}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#d95b00] hover:bg-[#b34700] text-white shadow-sm transition-colors active:scale-95"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Setujui Semua yang Diajukan</span>
          </button>
        </div>
      )}
      
      {/* Controls Bar: Search, Category, Status, Sort (Notion Database Controls) */}
      <div className="bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e] rounded-xl p-2.5 shadow-sm flex flex-col md:flex-row gap-2.5 items-center justify-between">
        
        {/* Search Input (Notion Search Pill) */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-[#787671] dark:text-[#787774] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aktivitas, capaian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#e5e3df] dark:border-[#383838] bg-[#f7f6f3] dark:bg-[#262626] text-[#37352f] dark:text-[#e3e2e0] placeholder-[#787671] dark:placeholder-[#787774] focus:outline-none focus:border-[#5645d4] transition-colors"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none pl-7 pr-7 py-1.5 text-xs font-medium rounded-md border border-[#e5e3df] dark:border-[#383838] bg-[#f7f6f3] dark:bg-[#262626] text-[#37352f] dark:text-[#e3e2e0] focus:outline-none focus:border-[#5645d4] transition-colors cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Filter className="w-3 h-3 text-[#787671] dark:text-[#787774] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="flex-1 sm:flex-initial">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full appearance-none px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#e5e3df] dark:border-[#383838] bg-[#f7f6f3] dark:bg-[#262626] text-[#37352f] dark:text-[#e3e2e0] focus:outline-none focus:border-[#5645d4] transition-colors cursor-pointer"
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#e5e3df] dark:border-[#383838] bg-[#f7f6f3] dark:bg-[#262626] text-[#37352f] dark:text-[#e3e2e0] hover:bg-[#ede9e4] dark:hover:bg-[#303030] transition-colors"
            title="Urutkan Tanggal"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
          </button>

          {/* Restore Default Entries Button */}
          <button
            onClick={() => {
              if (window.confirm('Pulihkan data contoh logbook bawaan klinik dan akademik?')) {
                restoreDefaultEntries();
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#e5e3df] dark:border-[#383838] bg-[#f7f6f3] dark:bg-[#262626] text-[#37352f] dark:text-[#e3e2e0] hover:bg-[#ede9e4] dark:hover:bg-[#303030] transition-colors"
            title="Pulihkan Data Contoh / Bawaan"
          >
            <RotateCcw className="w-3 h-3 text-[#5645d4] dark:text-[#a78bfa]" />
            <span className="hidden sm:inline">Pulihkan Contoh</span>
          </button>

          {/* Cloud Sync Button */}
          <button
            onClick={async () => {
              setIsSyncing(true);
              const res = await syncWithCloud();
              setIsSyncing(false);
              alert(res.message || 'Sinkronisasi selesai.');
            }}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#e5e3df] dark:border-[#383838] bg-[#f7f6f3] dark:bg-[#262626] text-[#37352f] dark:text-[#e3e2e0] hover:bg-[#ede9e4] dark:hover:bg-[#303030] transition-colors"
            title="Sinkronkan catatan antara PC dan Android via Cloud"
          >
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 text-[#5645d4] dark:text-[#a78bfa] animate-spin" />
            ) : (
              <Cloud className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            )}
            <span className="hidden sm:inline">{isSyncing ? 'Menyinkron...' : 'Sinkron Cloud'}</span>
          </button>

          {/* New Entry Button */}
          <Link
            href="/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#5645d4] hover:bg-[#4534b3] text-white shadow-sm transition-colors active:scale-95 ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Entri</span>
          </Link>
        </div>

      </div>

      {/* Entries List Cards */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e] rounded-xl p-10 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl notion-badge-lavender flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">
            Belum Ada Catatan Kegiatan
          </h3>
          <p className="text-xs text-[#787671] dark:text-[#787774] max-w-sm mx-auto mb-4">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Tidak ada log kegiatan yang cocok dengan filter pencarian.'
              : `Mulai isi logbook harian untuk program ${programConfig.label}.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => restoreDefaultEntries()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold border border-[#5645d4] text-[#5645d4] dark:text-[#a78bfa] dark:border-[#a78bfa] hover:bg-[#5645d4]/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Pulihkan Data Contoh Logbook</span>
            </button>
            <Link
              href="/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#5645d4] hover:bg-[#4534b3] text-white shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Entri Pertama</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-[#202020] border border-[#e5e3df] dark:border-[#2e2e2e] rounded-xl p-4 shadow-sm hover:border-[#c8c4be] dark:hover:border-[#3e3e3e] transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3.5">
                
                {/* Main Content Info */}
                <div className="flex-1 space-y-2.5">
                  
                  {/* Meta Pills: Date, Time, Duration, Category, Status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f0eeec] dark:bg-[#282828] text-[#37352f] dark:text-[#e3e2e0]">
                      <Calendar className="w-3 h-3 text-[#5645d4] dark:text-[#a78bfa]" />
                      <span>{new Date(entry.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </span>

                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f0eeec] dark:bg-[#282828] text-[#5d5b54] dark:text-[#9b9a97]">
                      <Clock className="w-3 h-3 text-[#787671] dark:text-[#787774]" />
                      <span>{entry.startTime} - {entry.endTime}</span>
                      <span className="font-semibold text-[#5645d4] dark:text-[#a78bfa] ml-0.5">({entry.durationHours} Jam)</span>
                    </span>

                    {/* Notion Pastel Category Tag */}
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getCategoryBadgeClass(entry.category)}`}>
                      {entry.category}
                    </span>

                    {/* Notion Status Pill */}
                    <div className="relative">
                      <select
                        value={entry.status}
                        onChange={(e) => handleStatusChange(entry.id, e.target.value as LogEntry['status'])}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded appearance-none cursor-pointer pr-5 transition-colors ${
                          entry.status === 'approved'
                            ? 'notion-badge-mint'
                            : entry.status === 'submitted'
                            ? 'notion-badge-peach'
                            : 'notion-badge-gray'
                        }`}
                      >
                        <option value="draft">● Draft</option>
                        <option value="submitted">● Diajukan</option>
                        <option value="approved">● Disetujui</option>
                      </select>
                      <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] opacity-60">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm sm:text-base font-semibold text-[#1a1a1a] dark:text-white tracking-tight">
                    {entry.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#37352f] dark:text-[#d4d4d4] leading-relaxed whitespace-pre-line">
                    {entry.description}
                  </p>

                  {/* Achievements / Output (Notion Callout) */}
                  {entry.achievements && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#fafaf9] dark:bg-[#262626] border border-[#e5e3df] dark:border-[#2e2e2e] text-xs text-[#5d5b54] dark:text-[#9b9a97]">
                      <Award className="w-3.5 h-3.5 text-[#d95b00] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#1a1a1a] dark:text-white">Capaian / Luaran: </span>
                        <span>{entry.achievements}</span>
                      </div>
                    </div>
                  )}

                  {/* Supervisor Feedback (Notion Callout) */}
                  {entry.supervisorFeedback && editingFeedbackId !== entry.id && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#dcecfa]/30 dark:bg-[#0075de]/10 border border-[#dcecfa] dark:border-[#0075de]/25 text-xs text-[#005bab] dark:text-[#93c5fd]">
                      <MessageSquare className="w-3.5 h-3.5 text-[#0075de] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold text-[#1a1a1a] dark:text-white">Catatan Pembimbing: </span>
                        <span>{entry.supervisorFeedback}</span>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setEditingFeedbackId(entry.id);
                            setFeedbackInputs(prev => ({ ...prev, [entry.id]: entry.supervisorFeedback || '' }));
                          }}
                          className="text-[10px] text-[#0075de] underline font-semibold hover:opacity-80 ml-2"
                        >
                          Ubah
                        </button>
                      )}
                    </div>
                  )}

                  {/* Admin Feedback Inline Input */}
                  {isAdmin && (editingFeedbackId === entry.id || !entry.supervisorFeedback) && (
                    <div className="p-2.5 rounded-lg bg-[#ffe8d4]/20 dark:bg-[#d95b00]/10 border border-[#ffe8d4] dark:border-[#d95b00]/25 space-y-1.5">
                      <label className="text-[10px] font-bold text-[#793400] dark:text-[#fb923c] flex items-center gap-1.5">
                        <Crown className="w-3 h-3" />
                        <span>Beri Evaluasi / Feedback Pembimbing:</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Tulis catatan evaluasi atau apresiasi..."
                          value={feedbackInputs[entry.id] ?? (entry.supervisorFeedback || '')}
                          onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [entry.id]: e.target.value }))}
                          className="flex-1 px-2.5 py-1 text-xs rounded-md border border-[#c8c4be] dark:border-[#3e3e3e] bg-white dark:bg-[#202020] text-[#37352f] dark:text-[#e3e2e0] focus:outline-none focus:border-[#5645d4]"
                        />
                        <button
                          onClick={() => handleSaveFeedback(entry.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#d95b00] hover:bg-[#b34700] text-white rounded-md shadow-sm transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>Simpan & Setujui</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column: Photo Attachment & Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2.5 pt-2.5 md:pt-0 border-t md:border-t-0 border-[#e5e3df] dark:border-[#2e2e2e]">
                  
                  {/* Photo Thumbnail */}
                  {entry.imageUrl ? (
                    <button
                      onClick={() => setPreviewImage({ url: entry.imageUrl!, title: entry.title })}
                      className="relative w-20 h-16 rounded-md overflow-hidden border border-[#e5e3df] dark:border-[#2e2e2e] group/thumb shadow-sm hover:border-[#5645d4] transition-all shrink-0"
                      title="Klik untuk melihat bukti foto kegiatan"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.imageUrl}
                        alt="Bukti Kegiatan"
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    </button>
                  ) : null}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {isAdmin && entry.status !== 'approved' && (
                      <button
                        onClick={() => reviewEntry(entry.id, 'approved', entry.supervisorFeedback || 'Disetujui oleh Super Admin.')}
                        className="px-2 py-1 text-xs font-semibold notion-badge-mint rounded-md hover:opacity-90 transition-opacity"
                        title="Setujui Entri Ini Langsung"
                      >
                        ✓ Setujui
                      </button>
                    )}

                    {/* Edit Logbook Button */}
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-[#c8c4be] dark:border-[#3e3e3e] hover:bg-[#f7f6f3] dark:hover:bg-[#262626] text-[#37352f] dark:text-[#e3e2e0] rounded-md transition-colors"
                      title="Edit / Ubah Isi Catatan Ini"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(entry.id, entry.title)}
                      className="p-1 text-[#787671] dark:text-[#787774] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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

      {/* Edit Entry Modal */}
      <EditLogbookModal
        isOpen={Boolean(editingEntry)}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
      />

    </div>
  );
}
